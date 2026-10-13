import assert from 'node:assert/strict';
import { realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

// Test the actual patched transitive dependency used by the shadcn toolchain.
const shadcnRequire = createRequire(
  realpathSync(new URL('../node_modules/shadcn/package.json', import.meta.url))
);
const globRequire = createRequire(shadcnRequire.resolve('fast-glob'));
const micromatchRequire = createRequire(globRequire.resolve('micromatch'));
const braces = micromatchRequire('braces');

test('patched toolchain preserves normal brace expansion', () => {
  assert.deepEqual(braces.expand('src/{blocks,components}/*.tsx'), [
    'src/blocks/*.tsx',
    'src/components/*.tsx',
  ]);
});

test('patched toolchain rejects deep AST nesting before recursive visitors', () => {
  const input = '{'.repeat(1000) + 'x' + '}'.repeat(1000);
  for (const method of ['parse', 'compile', 'expand']) {
    assert.throws(
      () => braces[method](input),
      /nesting exceeds the safe limit/
    );
  }
});
