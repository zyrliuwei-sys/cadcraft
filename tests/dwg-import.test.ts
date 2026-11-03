import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { convertDwgToDxf } from 'dwgdxf';

import {
  DrawingImportError,
  DWG_TIMEOUT_MS,
  dxfName,
  MAX_DWG_BYTES,
  validateDwgHeader,
} from '../src/lib/dwg-format';
import { convertDwg } from '../src/lib/dwg-import';

test('DWG import rejects renamed files, truncated data, unsupported revisions and oversized input', () => {
  const header = (text: string) => new TextEncoder().encode(text);
  const rejects = (text: string, size: number, code: string) =>
    assert.throws(
      () => validateDwgHeader(header(text), size),
      (e) => e instanceof DrawingImportError && e.code === code
    );
  rejects('notdwg', 1024, 'invalid');
  rejects('AC1032', 10, 'invalid');
  rejects('AC1009', 1024, 'version');
  rejects('AC1099', 1024, 'version');
  rejects('AC1032', MAX_DWG_BYTES + 1, 'too_large');
  assert.equal(validateDwgHeader(header('AC1032'), MAX_DWG_BYTES), 'AC1032');
  assert.equal(dxfName('plan.v2.DWG'), 'plan.v2.dxf');
});

test('the pinned WASM reader converts a real 2018 DWG into DXF with drawable entities', async () => {
  const bytes = await readFile(
    new URL('./fixtures/dwg/sample_AC1032.dwg', import.meta.url)
  );
  assert.equal(validateDwgHeader(bytes.subarray(0, 6), bytes.length), 'AC1032');
  const result = await convertDwgToDxf(bytes);
  const text = new TextDecoder().decode(result);
  assert.match(text, /\bSECTION\b/);
  assert.match(text, /\bENTITIES\b[\s\S]*\bLINE\b/);
  assert.match(text, /\bEOF\s*$/);
});

test('corrupted DWG bytes fail conversion rather than producing a successful import', async () => {
  const corrupt = new Uint8Array(1024);
  corrupt.set(new TextEncoder().encode('AC1032'));
  await assert.rejects(convertDwgToDxf(corrupt));
});

test('a cancelled DWG never starts a worker', async () => {
  const controller = new AbortController();
  controller.abort();
  const bytes = new Uint8Array(128);
  bytes.set(new TextEncoder().encode('AC1032'));
  await assert.rejects(
    convertDwg(new File([bytes], 'plan.dwg'), controller.signal, () => {}),
    (e) => e instanceof DrawingImportError && e.code === 'cancelled'
  );
});

test('cancelling an active conversion terminates its worker', async (t) => {
  let started = false;
  let terminated = false;
  class WorkerStub {
    postMessage() {
      started = true;
    }
    terminate() {
      terminated = true;
    }
  }
  const original = Object.getOwnPropertyDescriptor(globalThis, 'Worker');
  Object.defineProperty(globalThis, 'Worker', {
    configurable: true,
    value: WorkerStub,
  });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'Worker', original);
    else Reflect.deleteProperty(globalThis, 'Worker');
  });
  const controller = new AbortController();
  const bytes = new Uint8Array(128);
  bytes.set(new TextEncoder().encode('AC1032'));
  const pending = convertDwg(
    new File([bytes], 'plan.dwg'),
    controller.signal,
    () => {}
  );
  const rejected = assert.rejects(
    pending,
    (e) => e instanceof DrawingImportError && e.code === 'cancelled'
  );
  for (let i = 0; i < 20 && !started; i++)
    await new Promise((r) => setImmediate(r));
  assert.equal(started, true);
  controller.abort();
  await rejected;
  assert.equal(terminated, true);
});

test('an unresponsive converter is terminated at the time limit', async (t) => {
  let started = false;
  let terminated = false;
  class WorkerStub {
    postMessage() {
      started = true;
    }
    terminate() {
      terminated = true;
    }
  }
  const original = Object.getOwnPropertyDescriptor(globalThis, 'Worker');
  Object.defineProperty(globalThis, 'Worker', {
    configurable: true,
    value: WorkerStub,
  });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'Worker', original);
    else Reflect.deleteProperty(globalThis, 'Worker');
  });
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const bytes = new Uint8Array(128);
  bytes.set(new TextEncoder().encode('AC1032'));
  const pending = convertDwg(
    new File([bytes], 'plan.dwg'),
    new AbortController().signal,
    () => {}
  );
  const rejected = assert.rejects(
    pending,
    (e) => e instanceof DrawingImportError && e.code === 'timeout'
  );
  for (let i = 0; i < 20 && !started; i++)
    await new Promise((r) => setImmediate(r));
  assert.equal(started, true);
  t.mock.timers.tick(DWG_TIMEOUT_MS);
  await rejected;
  assert.equal(terminated, true);
});
