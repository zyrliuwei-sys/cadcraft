import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { extname, join, relative, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  checkPage,
  checkSitemap,
  checkText,
  sourceRoots,
  textExtensions,
} from './site-check-policy.mjs';

const rootArg = process.argv.indexOf('--root');
const root = rootArg < 0 ? process.cwd() : resolve(process.argv[rootArg + 1]);
const sourceOnly = process.argv.includes('--source-only');
const issues = [];

function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    // Do not follow dependency/worktree symlinks or scan generated message caches.
    if (
      entry.isSymbolicLink() ||
      ['node_modules', 'paraglide'].includes(entry.name)
    )
      return [];
    return entry.isDirectory()
      ? filesUnder(path)
      : textExtensions.has(extname(path))
        ? [path]
        : [];
  });
}

function scan(files) {
  for (const file of files)
    issues.push(...checkText(readFileSync(file, 'utf8'), relative(root, file)));
}

function fail() {
  if (!issues.length) return;
  console.error(
    `FAIL site check (${issues.length} finding${issues.length === 1 ? '' : 's'})`
  );
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exitCode = 1;
  return true;
}

async function freePort() {
  const server = createServer();
  await new Promise((done, reject) =>
    server.once('error', reject).listen(0, '127.0.0.1', done)
  );
  const port = server.address().port;
  await new Promise((done) => server.close(done));
  return port;
}

async function renderedChecks() {
  const output = join(root, '.output');
  const config = JSON.parse(readFileSync(join(output, 'nitro.json'), 'utf8'));
  const cloudflare = /cloudflare/.test(config.preset);
  const port = await freePort();
  const temporary = mkdtempSync(join(tmpdir(), 'cadcraft-site-check-'));
  // Ephemeral test-only credentials/storage. Never migrate or write to production D1.
  const secret = randomBytes(32).toString('hex');
  const args = cloudflare
    ? [
        join(root, 'scripts/site-check-preview.mjs'),
        join(output, 'server/index.mjs'),
      ]
    : [join(output, 'server/index.mjs')];
  const child = spawn(process.execPath, args, {
    cwd: root,
    detached: process.platform !== 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: String(port),
      AUTH_SECRET: secret,
      DATABASE_PROVIDER: 'sqlite',
      DATABASE_URL: `file:${temporary}/check.db`,
      D1_REMOTE_HTTP: 'false',
      WRANGLER_SEND_METRICS: 'false',
      BROWSER: 'none',
      CI: 'true',
    },
  });
  let log = '';
  child.stdout.on('data', (data) => {
    log = (log + data).slice(-12000);
  });
  child.stderr.on('data', (data) => {
    log = (log + data).slice(-12000);
  });
  let launchError;
  child.on('error', (error) => {
    launchError = error;
  });
  const base = `http://127.0.0.1:${port}`;
  async function get(path) {
    const response = await fetch(base + path, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    });
    if (response.status !== 200)
      throw new Error(`${path}: HTTP ${response.status}; expected 200`);
    return response.text();
  }
  try {
    let ready = false;
    const deadline = Date.now() + 45000;
    while (Date.now() < deadline) {
      if (launchError || child.exitCode !== null)
        throw new Error(
          `Preview could not start: ${launchError?.message ?? `exit ${child.exitCode}`}`
        );
      try {
        const r = await fetch(base + '/', {
          signal: AbortSignal.timeout(1000),
        });
        if (r.status === 200) {
          ready = true;
          break;
        }
      } catch {}
      await delay(500);
    }
    if (!ready)
      throw new Error('Preview did not return HTTP 200 before the deadline');

    const sitemap = await get('/sitemap.xml');
    issues.push(...checkSitemap(sitemap));
    const paths = new Set([
      '/',
      '/about',
      '/contact',
      '/privacy-policy',
      '/terms-of-service',
      '/acceptable-use-policy',
    ]);
    for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g))
      paths.add(new URL(match[1]).pathname);
    // Noindex articles still return 200 and must pass the same content/URL checks.
    for (const file of filesUnder(join(root, 'src/content/posts')).filter((p) =>
      p.endsWith('.en.mdx')
    )) {
      paths.add('/blog/' + file.split('/').at(-1).replace('.en.mdx', ''));
    }
    for (const path of paths) issues.push(...checkPage(await get(path), path));
    if (!issues.length) {
      console.log(
        `PASS SSR preview: ${cloudflare ? 'compiled Worker handler / Node adapter' : 'Node production server'}; isolated test storage`
      );
      console.log(
        `PASS rendered pages: ${paths.size}; one Draw strip; at most one AdSense loader per page`
      );
      console.log(
        'PASS canonical, internal links and sitemap: HTTPS, no non-root trailing slash'
      );
    }
  } catch (error) {
    issues.push(error.message);
    // Only preview logs from the isolated local runtime; redact the generated test secret.
    console.error(log.replaceAll(secret, '[test-secret]'));
  } finally {
    const exited = new Promise((done) => child.once('close', done));
    try {
      process.platform === 'win32'
        ? child.kill('SIGTERM')
        : process.kill(-child.pid, 'SIGTERM');
    } catch {}
    await Promise.race([exited, delay(3000, undefined, { ref: false })]);
    try {
      process.platform === 'win32'
        ? child.kill('SIGKILL')
        : process.kill(-child.pid, 'SIGKILL');
    } catch {}
    rmSync(temporary, { recursive: true, force: true });
  }
}

async function main() {
  const sourceFiles = sourceRoots.flatMap((name) =>
    filesUnder(join(root, name))
  );
  for (const name of [
    'vite.config.ts',
    'wrangler.production.json',
    '.env.example',
    'Dockerfile',
  ]) {
    const path = join(root, name);
    if (existsSync(path)) sourceFiles.push(path);
  }
  scan(sourceFiles);
  const reviewPath = join(root, 'src/content/about-review.json');
  if (existsSync(reviewPath)) {
    const review = JSON.parse(readFileSync(reviewPath, 'utf8'));
    const version = readFileSync(
      join(root, 'src/config/cadcraft.ts'),
      'utf8'
    ).match(/CADCRAFT_VERSION\s*=\s*['"]([^'"]+)['"]/)?.[1];
    if (
      review.version !== version ||
      !/^\d{4}-\d{2}-\d{2}$/.test(review.date)
    ) {
      issues.push(
        'about-review.json: review date/release must be recorded for the current CADCraft version'
      );
    }
  }
  const definitions = sourceFiles
    .filter((p) => /\.[cm]?[jt]sx?$/.test(p))
    .reduce(
      (n, p) =>
        n +
        (readFileSync(p, 'utf8').match(/pagead\/js\/adsbygoogle\.js/g)
          ?.length ?? 0),
      0
    );
  if (definitions > 1)
    issues.push(
      `source: ${definitions} AdSense loader URL definitions; keep one shared loader`
    );
  if (fail()) return;
  console.log(
    `PASS source: ${sourceFiles.length} text files; forbidden ads, retired versions and HTTP URLs: 0`
  );
  if (sourceOnly) return;

  if (!existsSync(join(root, '.output/nitro.json')))
    throw new Error(
      'Build output missing; run pnpm build or pnpm cf:build first'
    );
  const artifacts = filesUnder(join(root, '.output'));
  scan(artifacts);
  if (fail()) return;
  console.log(
    `PASS build: ${artifacts.length} text files; forbidden ads, retired versions and HTTP URLs: 0`
  );
  await renderedChecks();
  if (!fail()) console.log('PASS site regression check');
}

if (resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`FAIL site check: ${error.message}`);
    process.exitCode = 1;
  });
}
