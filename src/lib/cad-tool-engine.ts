import { CADCRAFT_VERSION, cadcraftLinks } from '@/config/cadcraft';
import { attachEditor } from '@/lib/cad-editor';
import {
  convertDwg,
  DrawingImportError,
  MAX_DXF_BYTES,
} from '@/lib/dwg-import';
import { dxfGeometry } from '@/lib/dxf-activity';

export type ToolPhase = 'loading' | 'converting' | 'opening' | 'exporting';
export type ToolErrorCode =
  | 'file_type'
  | 'invalid'
  | 'version'
  | 'too_large'
  | 'empty'
  | 'engine'
  | 'export'
  | 'timeout'
  | 'cancelled';
export class CadToolError extends Error {
  constructor(public readonly code: ToolErrorCode) {
    super(code);
  }
}

const BINARY_DXF = 'AutoCAD Binary DXF\r\n\x1a\0';
const DXF_VERSIONS = new Set([
  'AC1009',
  'AC1012',
  'AC1014',
  'AC1015',
  'AC1018',
  'AC1021',
  'AC1024',
  'AC1027',
  'AC1032',
]);

/** Fast checks only; the existing CADCraft reader performs the full decode. */
export async function validateToolDxf(file: File) {
  if (!/\.dxf$/i.test(file.name)) throw new CadToolError('file_type');
  if (file.size > MAX_DXF_BYTES) throw new CadToolError('too_large');
  const head = await file.slice(0, 128 * 1024).text();
  const binary = head.startsWith(BINARY_DXF);
  const version = /\$ACADVER[\s\S]{0,32}?(AC10\d{2})/.exec(head)?.[1];
  if (
    version &&
    (!DXF_VERSIONS.has(version) || (binary && version === 'AC1009'))
  )
    throw new CadToolError('version');
  if (
    !binary &&
    !/^\uFEFF?\s*(?:999\s*\r?\n[^\r\n]*\r?\n\s*)*0\s*\r?\nSECTION\b/.test(head)
  )
    throw new CadToolError('invalid');
  return { binary, version };
}

function cancelled(signal: AbortSignal) {
  if (signal.aborted) throw new CadToolError('cancelled');
}

function pause(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new CadToolError('cancelled'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) {
      signal.removeEventListener('abort', abort);
      abort();
    }
  });
}

/** Reuses the exact /online WASM build, file bridge, DXF reader and plotter.
 * A fresh, noninteractive engine frame is disposed after every operation.
 * It is not the /online page and mounts no autosave/cloud/account hooks.
 */
export async function exportLocalDrawing(
  file: File,
  output: 'svg' | 'pdf',
  signal: AbortSignal,
  onPhase: (phase: ToolPhase) => void
): Promise<Blob> {
  cancelled(signal);
  if (!(output === 'pdf' ? /\.(dwg|dxf)$/i : /\.dxf$/i).test(file.name))
    throw new CadToolError('file_type');
  const dwg = /\.dwg$/i.test(file.name);
  if (!dwg) await validateToolDxf(file);
  onPhase(dwg ? 'converting' : 'loading');
  const drawing = dwg
    ? await convertDwg(file, signal, () => onPhase('converting'))
    : file;
  cancelled(signal);
  onPhase('loading');
  const frame = document.createElement('iframe');
  frame.title = 'Local drawing processor';
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  // The canvas needs real dimensions and animation frames, even when offscreen.
  frame.style.cssText =
    'position:fixed;left:-10000px;top:0;width:1024px;height:768px;opacity:0;pointer-events:none;border:0';
  frame.src = `${cadcraftLinks.app}?webgl&tool=1&v=${CADCRAFT_VERSION}`;
  let bridge: ReturnType<typeof attachEditor> = null;
  let restoreDownload: (() => void) | undefined;
  const removeFrame = () => {
    bridge?.dispose();
    frame.remove();
  };
  signal.addEventListener('abort', removeFrame, { once: true });
  document.body.appendChild(frame);
  try {
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      cancelled(signal);
      const doc = frame.contentDocument;
      if (
        doc?.getElementById('cadcraft_canvas') &&
        !doc.getElementById('cadcraft_loading')
      ) {
        bridge = attachEditor(frame, {});
        if (bridge?.ready()) break;
      }
      await pause(100, signal);
    }
    if (!bridge?.ready()) throw new CadToolError('engine');
    onPhase('opening');
    if (!bridge.open(drawing)) throw new CadToolError('engine');
    const confirmed = await bridge.confirmOpen(drawing.name, signal);
    cancelled(signal);
    if (!confirmed || confirmed.size > MAX_DXF_BYTES)
      throw new CadToolError('invalid');
    // QSAVE preserves binary DXF. Do not interpret its bytes as ASCII group pairs.
    if (
      !(await confirmed.slice(0, 22).text()).startsWith(BINARY_DXF) &&
      !dxfGeometry(await confirmed.text())
    )
      throw new CadToolError('empty');
    onPhase('exporting');
    const win = frame.contentWindow as (Window & typeof globalThis) | null;
    const doc = frame.contentDocument;
    const canvas = doc?.getElementById('cadcraft_canvas');
    const input = doc?.querySelector<HTMLInputElement>('input[type="text"]');
    if (!win || !canvas || !input) throw new CadToolError('engine');
    const prototype = win.HTMLAnchorElement.prototype;
    const click = prototype.click;
    let result: Blob | undefined;
    let failed = false;
    prototype.click = function () {
      if (
        this.download === `cadcraft-result.${output}` &&
        this.href.startsWith('blob:')
      ) {
        // Local Blob only. Capture before upstream revokes the URL; do not auto-download.
        void win
          .fetch(this.href)
          .then((r) => r.blob())
          .then(
            (blob) => {
              result = blob;
            },
            () => {
              failed = true;
            }
          );
        return;
      }
      return click.call(this);
    };
    restoreDownload = () => {
      prototype.click = click;
    };
    const active = document.activeElement as HTMLElement | null;
    canvas.focus({ preventScroll: true });
    // Eframe's text agent accepts one input event as one command line, including JSON.
    // All command text is a fixed program constant; filenames never become commands.
    input.value = `exportpdf ${JSON.stringify({ path: `cadcraft-result.${output}`, output, layout: 'Model', plotArea: 'extents', fit: true, center: true, lineweights: true })}`;
    input.dispatchEvent(
      new win.InputEvent('input', {
        data: input.value,
        inputType: 'insertText',
        bubbles: true,
      })
    );
    await pause(100, signal);
    for (const type of ['keydown', 'keyup'])
      canvas.dispatchEvent(
        new win.KeyboardEvent(type, {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          bubbles: true,
          cancelable: true,
        })
      );
    if (active?.isConnected && active !== frame)
      active.focus({ preventScroll: true });
    const exportDeadline = Date.now() + 30_000;
    while (!result && !failed && Date.now() < exportDeadline)
      await pause(100, signal);
    cancelled(signal);
    if (!result) throw new CadToolError(failed ? 'export' : 'timeout');
    await validateToolOutput(result, output);
    return new Blob([result], {
      type: output === 'pdf' ? 'application/pdf' : 'image/svg+xml',
    });
  } finally {
    signal.removeEventListener('abort', removeFrame);
    restoreDownload?.();
    removeFrame();
  }
}

export async function validateToolOutput(blob: Blob, output: 'svg' | 'pdf') {
  if (blob.size < 100 || blob.size > MAX_DXF_BYTES)
    throw new CadToolError('export');
  const head = await blob.slice(0, 1024).text();
  if (output === 'pdf' ? !head.startsWith('%PDF-') : !/<svg\b/.test(head))
    throw new CadToolError('export');
  if (output === 'pdf' && !(await blob.slice(-1024).text()).includes('%%EOF'))
    throw new CadToolError('export');
}

export function toolErrorCode(cause: unknown): string {
  return cause instanceof CadToolError || cause instanceof DrawingImportError
    ? cause.code
    : 'engine';
}
