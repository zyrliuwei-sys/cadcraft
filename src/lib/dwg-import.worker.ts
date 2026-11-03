import { convertDwgToDxf, init } from 'dwgdxf';

import { DWG_WASM_PATH, MAX_DXF_BYTES } from './dwg-format';

// Absolute HTTP URL keeps the package's loader on its browser path in a worker.
const options = { wasmBase: new URL(DWG_WASM_PATH, self.location.origin).href };
self.onmessage = async (event: MessageEvent<ArrayBuffer>) => {
  try {
    await init(options);
    self.postMessage({ type: 'converting' });
    const result = await convertDwgToDxf(event.data, options);
    if (result.byteLength > MAX_DXF_BYTES) {
      self.postMessage({ type: 'error', code: 'too_large' });
      return;
    }
    const head = new TextDecoder().decode(result.subarray(0, 128));
    const tail = new TextDecoder().decode(result.subarray(-32));
    if (!head.includes('SECTION') || !tail.includes('EOF'))
      throw new Error('Invalid DXF');
    const bytes = new Uint8Array(result).buffer;
    self.postMessage({ type: 'done', bytes }, { transfer: [bytes] });
  } catch {
    self.postMessage({ type: 'error', code: 'conversion' });
  }
};
