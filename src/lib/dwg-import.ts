import {
  DrawingImportError,
  DWG_TIMEOUT_MS,
  dxfName,
  validateDwgHeader,
  type ImportErrorCode,
} from './dwg-format';

export * from './dwg-format';

/** One disposable worker per drawing: cancel/timeout also release WASM memory. */
export async function convertDwg(
  file: File,
  signal: AbortSignal,
  onConverting: () => void
): Promise<File> {
  validateDwgHeader(
    new Uint8Array(await file.slice(0, 6).arrayBuffer()),
    file.size
  );
  if (signal.aborted) throw new DrawingImportError('cancelled');
  const bytes = await file.arrayBuffer();
  if (signal.aborted) throw new DrawingImportError('cancelled');

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./dwg-import.worker.ts', import.meta.url),
      {
        type: 'module',
      }
    );
    let settled = false;
    const finish = (error?: ImportErrorCode, output?: ArrayBuffer) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      worker.terminate();
      if (error) reject(new DrawingImportError(error));
      else if (output)
        resolve(
          new File([output], dxfName(file.name), { type: 'application/dxf' })
        );
      else reject(new DrawingImportError('conversion'));
    };
    const cancel = () => finish('cancelled');
    const timer = setTimeout(() => finish('timeout'), DWG_TIMEOUT_MS);
    signal.addEventListener('abort', cancel, { once: true });
    worker.onerror = (event) => {
      event.preventDefault();
      finish('conversion');
    };
    worker.onmessage = (
      event: MessageEvent<{
        type: 'converting' | 'done' | 'error';
        bytes?: ArrayBuffer;
        code?: ImportErrorCode;
      }>
    ) => {
      if (settled) return;
      if (event.data.type === 'converting') onConverting();
      else if (event.data.type === 'error')
        finish(event.data.code ?? 'conversion');
      else if (event.data.type === 'done') finish(undefined, event.data.bytes);
    };
    worker.postMessage(bytes, [bytes]);
  });
}
