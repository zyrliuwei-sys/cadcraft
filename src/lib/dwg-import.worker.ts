import { DWG_WASM_PATH, MAX_DXF_BYTES } from './dwg-format';

// The build script copies these exact assets from the pinned npm package.
// Load from our origin without the package's CDN/Node loader branches.
const wasmBase = new URL(DWG_WASM_PATH, self.location.origin).href;
type DwgRuntime = {
  default: (input: { module_or_path: string }) => Promise<unknown>;
  convertDwgToDxf: (bytes: Uint8Array) => Uint8Array;
};
self.onmessage = async (event: MessageEvent<ArrayBuffer>) => {
  let loaded = false;
  try {
    const runtime = (await import(
      /* @vite-ignore */ `${wasmBase}/dwgdxf.js`
    )) as DwgRuntime;
    await runtime.default({ module_or_path: `${wasmBase}/dwgdxf_bg.wasm` });
    loaded = true;
    self.postMessage({ type: 'converting' });
    const result = runtime.convertDwgToDxf(new Uint8Array(event.data));
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
    self.postMessage({
      type: 'error',
      code: loaded ? 'conversion' : 'reader_failed',
    });
  }
};
