// Runs after `cf:build`: fail before deploying a Worker config that lost a
// binding the app needs. Both deploy paths (local wrangler.jsonc and the
// Cloudflare Builds copy of wrangler.production.json) end up merged here.
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync('.output/server/wrangler.json', 'utf8'));
const problems = [];

if (!config.d1_databases?.some((d) => d.binding === 'DB'))
  problems.push('D1 binding "DB"');
// Cloud drawings (src/modules/drawings) — without it every save fails.
if (!config.r2_buckets?.some((b) => b.binding === 'DRAWINGS'))
  problems.push('R2 binding "DRAWINGS"');
if (!/^https:\/\//.test(config.vars?.VITE_APP_URL ?? ''))
  problems.push('var "VITE_APP_URL"');

if (problems.length) {
  console.error(
    `\n✖ Worker config is missing: ${problems.join(', ')}.\n` +
      '  Fix wrangler.jsonc (local) or wrangler.production.json (Cloudflare Builds).\n'
  );
  process.exit(1);
}
console.log('✓ Worker config has DB, DRAWINGS and VITE_APP_URL');
