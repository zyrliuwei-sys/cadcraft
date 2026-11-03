import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

// Self-host the pinned converter: drawings and WASM never visit a third party.
const require = createRequire(import.meta.url);
const dist = dirname(require.resolve('dwgdxf'));
const output = resolve('public/dwg-converter/2.0.1');
mkdirSync(output, { recursive: true });
for (const file of ['dwgdxf.js', 'dwgdxf_bg.wasm']) {
  copyFileSync(resolve(dist, 'wasm', file), resolve(output, file));
}
copyFileSync(resolve(dist, '../LICENSE'), resolve(output, 'LICENSE'));
console.log('DWG converter assets ready (dwgdxf 2.0.1)');
