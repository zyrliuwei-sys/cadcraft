import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';

import { CADCRAFT_VERSION, cadcraftLinks } from '../src/config/cadcraft.ts';

const directory = new URL('../public/cadcraft-app/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('release.json', directory)));
assert.equal(manifest.version, CADCRAFT_VERSION);
const compressed = Buffer.concat(
  await Promise.all(
    manifest.gzip_parts.map(async (name) => {
      assert.match(name, /^[a-zA-Z0-9_.-]+$/);
      const bytes = await readFile(new URL(name, directory));
      assert.ok(bytes.length < 5 * 1024 * 1024);
      return bytes;
    })
  )
);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
assert.equal(hash(compressed), manifest.gzip_sha256);
const wasm = gunzipSync(compressed);
assert.equal(hash(wasm), manifest.wasm_sha256);
assert.ok(WebAssembly.validate(wasm));
console.log(
  `Verified hosted CADCraft ${CADCRAFT_VERSION}: lossless, valid WASM`
);

if (process.argv.includes('--network')) {
  for (const name of ['windows', 'macos', 'linux', 'web', 'checksums']) {
    const response = await fetch(cadcraftLinks[name], {
      method: 'HEAD',
      signal: AbortSignal.timeout(30_000),
    });
    assert.equal(response.status, 200, `${name}: ${cadcraftLinks[name]}`);
    console.log(`${name}: HTTP ${response.status}`);
  }
}
