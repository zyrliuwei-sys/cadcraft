import {
  convertDwg,
  DrawingImportError,
  DWG_TIMEOUT_MS,
  type ImportErrorCode,
} from './dwg-import';

export type PreviewPhase = 'loading' | 'converting' | 'rendering';
export type PreviewErrorCode =
  | ImportErrorCode
  | 'file_type'
  | 'graphics'
  | 'empty'
  | 'preview';
export class PreviewError extends Error {
  constructor(public readonly code: PreviewErrorCode) {
    super(code);
  }
}
export type DwgPreview = {
  fit: () => void;
  zoom: (factor: number) => void;
  destroy: () => void;
};

/** Local file → existing DWG worker → local DXF → view-only WebGL canvas. */
export async function openDwgPreview(
  file: File,
  container: HTMLElement,
  signal: AbortSignal,
  onPhase: (phase: PreviewPhase) => void
): Promise<DwgPreview> {
  if (!/\.dwg$/i.test(file.name)) throw new PreviewError('file_type');
  onPhase('loading');
  const dxf = await convertDwg(file, signal, () => onPhase('converting'));
  if (signal.aborted) throw new DrawingImportError('cancelled');
  onPhase('rendering');
  // No renderer, parser or GPU context is loaded until a valid DWG is selected.
  const { DxfViewer } = await import('dxf-viewer');
  if (signal.aborted) throw new DrawingImportError('cancelled');
  let viewer: InstanceType<typeof DxfViewer>;
  try {
    viewer = new DxfViewer(container, {
      autoResize: true,
      antialias: true,
      canvasWidth: container.clientWidth,
      canvasHeight: container.clientHeight,
      sceneOptions: { suppressPaperSpace: true },
    });
    if (!viewer.HasRenderer()) throw new Error('No renderer');
    viewer.SetClearColor(0x22282f); // Matches the existing online editor canvas.
  } catch {
    container.replaceChildren();
    throw new PreviewError('graphics');
  }

  let destroyed = false;
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    viewer.Destroy();
    container.replaceChildren();
  };
  const url = URL.createObjectURL(dxf);
  let cancel!: () => void;
  let timeout!: ReturnType<typeof setTimeout>;
  const interrupted = new Promise<never>((_, reject) => {
    cancel = () => {
      destroy();
      reject(new DrawingImportError('cancelled'));
    };
    signal.addEventListener('abort', cancel, { once: true });
    timeout = setTimeout(() => {
      destroy();
      reject(new DrawingImportError('timeout'));
    }, DWG_TIMEOUT_MS);
  });
  try {
    await Promise.race([
      viewer.Load({
        url,
        fonts: [
          new URL(
            '/fonts/dwg-viewer/NotoSans-Regular.ttf',
            window.location.origin
          ).href,
        ],
        workerFactory: () =>
          new Worker(new URL('./dwg-viewer.worker.ts', import.meta.url), {
            type: 'module',
          }),
      }),
      interrupted,
    ]);
    if (signal.aborted) throw new DrawingImportError('cancelled');
    const bounds = viewer.GetBounds();
    if (!bounds || !Object.values(bounds).every(Number.isFinite))
      throw new PreviewError('empty');
    const canvas = viewer.GetCanvas();
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'DWG drawing preview');
    const fit = () => {
      const origin = viewer.GetOrigin();
      viewer.FitView(
        bounds.minX - origin.x,
        bounds.maxX - origin.x,
        bounds.minY - origin.y,
        bounds.maxY - origin.y
      );
      viewer.Render();
    };
    fit();
    return {
      destroy,
      fit,
      zoom: (factor) => {
        const camera = viewer.GetCamera();
        const width = (camera.right - camera.left) / camera.zoom / factor;
        if (Number.isFinite(width) && width > 0) {
          viewer.SetView(camera.position.clone(), width);
          viewer.Render();
        }
      },
    };
  } catch (error) {
    destroy();
    if (error instanceof DrawingImportError || error instanceof PreviewError)
      throw error;
    throw new PreviewError('preview');
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', cancel);
    URL.revokeObjectURL(url);
  }
}
