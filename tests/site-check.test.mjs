import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  checkPage,
  checkSitemap,
  checkText,
  drawCommands,
} from '../scripts/site-check-policy.mjs';

test('forbidden ads are blocked; a dependency variable named formatOptions is allowed', () => {
  for (const bad of [
    'https://bellnewyork.org/21/key',
    'window.atOptions = {}',
    'adsterra',
  ]) {
    assert.ok(checkText(bad, 'source.tsx').length);
    assert.ok(checkText(bad, '.output/public/assets/chunk.js').length);
  }
  assert.deepEqual(
    checkText('function render(formatOptions) {}', 'vendor.js'),
    []
  );
});

test('retired releases are rejected in prose, constants and URLs, including sentence punctuation', () => {
  for (const text of [
    "const VERSION = '0.8.0'",
    'Tested with 0.8.0.',
    'tag/v0.8.0',
    'cadcraft-0.8.0-macos.dmg',
  ]) {
    assert.ok(
      checkText(text, 'content.mdx').some((s) => s.includes('retired'))
    );
  }
  assert.deepEqual(
    checkText('Current release 0.18.0; unrelated number 10.8.0', 'content.mdx'),
    []
  );
});

test('HTTP site URLs are rejected in HTML, JSON-LD, MDX and escaped bundles', () => {
  for (const text of [
    '[about](http://cadcraft.org/about)',
    '<link href="http://cadcraft.org/about">',
    '{"url":"http://cadcraft.org/"}',
    String.raw`http:\/\/cadcraft.org\/about`,
  ]) {
    assert.ok(checkText(text, 'page').some((s) => s.includes('insecure')));
  }
  assert.deepEqual(
    checkText('https://cadcraft.org/ http://www.w3.org/2000/svg', 'page'),
    []
  );
});

test('the rendered Draw strip cannot be duplicated even with nested spans and a second hidden track', () => {
  const track = drawCommands
    .split(' ')
    .map((s) => `<span><b>${s}</b></span>`)
    .join('');
  assert.deepEqual(checkPage(`<main>${track}</main>`, '/'), []);
  assert.ok(
    checkPage(`${track}<div aria-hidden="true">${track}</div>`, '/').some((s) =>
      s.includes('occurs 2')
    )
  );
});

test('AdSense loaders are counted per page, including different query strings and quote forms', () => {
  const one =
    '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=one"></script>';
  const two =
    "<script src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=two'></script>";
  assert.deepEqual(checkPage(one, '/about'), []);
  assert.deepEqual(checkPage(one, '/download'), []);
  assert.ok(
    checkPage(one + two, '/about').some((s) => s.includes('2 adsbygoogle'))
  );
});

test('non-root trailing slashes are rejected in links, metadata, JSON-LD and sitemap', () => {
  for (const html of [
    '<a href="/about/?ref=footer#team">About</a>',
    '<link rel="canonical" href="https://cadcraft.org/about/">',
    '<meta property="og:url" content="https://cadcraft.org/about/">',
    '<script type="application/ld+json">{"url":"https://cadcraft.org/about/"}</script>',
  ]) {
    assert.ok(
      checkPage(html, '/about').some((s) => s.includes('trailing slash'))
    );
  }
  assert.ok(checkSitemap('<loc>https://cadcraft.org/about/</loc>').length);
  assert.deepEqual(
    checkSitemap(
      '<loc>https://cadcraft.org/</loc><loc>https://cadcraft.org/about</loc>'
    ),
    []
  );
});

test('the command exits nonzero for a newly introduced source regression', () => {
  const root = mkdtempSync(join(tmpdir(), 'site-check-test-'));
  try {
    mkdirSync(join(root, 'src'));
    for (const bad of [
      'window.atOptions={}',
      "const VERSION='0.8.0'",
      'http://cadcraft.org/about',
    ]) {
      writeFileSync(join(root, 'src/regression.ts'), bad);
      const run = spawnSync(
        process.execPath,
        ['scripts/check-site.mjs', '--source-only', '--root', root],
        { encoding: 'utf8' }
      );
      assert.equal(run.status, 1, run.stderr);
      assert.match(run.stderr, /FAIL site check/);
    }
    writeFileSync(join(root, 'src/regression.ts'), "const VERSION='0.18.0'");
    assert.equal(
      spawnSync(process.execPath, [
        'scripts/check-site.mjs',
        '--source-only',
        '--root',
        root,
      ]).status,
      0
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a regression in a build artifact blocks the command before preview startup', () => {
  const root = mkdtempSync(join(tmpdir(), 'site-artifact-test-'));
  try {
    mkdirSync(join(root, '.output/public/assets'), { recursive: true });
    writeFileSync(join(root, '.output/nitro.json'), '{}');
    for (const bad of [
      'https://bellnewyork.org/22/key',
      "const release='0.8.0'",
      'http://cadcraft.org/about',
    ]) {
      writeFileSync(join(root, '.output/public/assets/rogue.js'), bad);
      const run = spawnSync(
        process.execPath,
        ['scripts/check-site.mjs', '--root', root],
        { encoding: 'utf8' }
      );
      assert.equal(run.status, 1, run.stderr);
      assert.match(run.stderr, /\.output[/\\]public[/\\]assets[/\\]rogue\.js/);
      assert.doesNotMatch(run.stderr, /Preview could not start/);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rendered regressions block the full command, not just the policy helper', () => {
  const root = mkdtempSync(join(tmpdir(), 'site-render-test-'));
  try {
    mkdirSync(join(root, '.output/server'), { recursive: true });
    writeFileSync(join(root, '.output/nitro.json'), '{"preset":"node-server"}');
    for (const html of [
      drawCommands + ' ' + drawCommands,
      drawCommands +
        '<script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=a"></script>' +
        '<script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=b"></script>',
    ]) {
      const server = `import {createServer} from 'node:http';
        createServer((q,r)=>r.end(q.url==='/sitemap.xml'?'<loc>https://cadcraft.org/</loc>':${JSON.stringify(html)}))
        .listen(Number(process.env.PORT),'127.0.0.1');`;
      writeFileSync(join(root, '.output/server/index.mjs'), server);
      const run = spawnSync(
        process.execPath,
        ['scripts/check-site.mjs', '--root', root],
        { encoding: 'utf8', timeout: 15000 }
      );
      assert.equal(run.status, 1, run.stderr);
      assert.match(
        run.stderr,
        /Draw command strip occurs 2|2 adsbygoogle.js loaders/
      );
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
