import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  File as FileIcon,
  Loader2,
  Minus,
  Plus,
  Scan,
  Upload,
} from 'lucide-react';

import { ctaPrimary, ctaSecondary } from '@/lib/cta';
import { DrawingImportError } from '@/lib/dwg-format';
import {
  openDwgPreview,
  PreviewError,
  type DwgPreview,
  type PreviewPhase,
} from '@/lib/dwg-preview';
import { cn } from '@/lib/utils';

export type DwgViewerLabels = {
  uploadTitle: string;
  choose: string;
  change: string;
  limits: string;
  empty: string;
  readOnly: string;
  canvas: string;
  fit: string;
  zoomIn: string;
  zoomOut: string;
  cancel: string;
  ready: string;
  cancelled: string;
  hint: string;
  fidelity: string;
  phases: Record<PreviewPhase, string>;
  errors: Record<string, string>;
};

export function DwgViewer({ labels }: { labels: DwgViewerLabels }) {
  const input = useRef<HTMLInputElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const preview = useRef<DwgPreview | null>(null);
  const operation = useRef<AbortController | null>(null);
  const [phase, setPhase] = useState<PreviewPhase | null>(null);
  const [name, setName] = useState('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  useEffect(
    () => () => {
      const pending = operation.current;
      operation.current = null;
      pending?.abort();
      preview.current?.destroy();
      preview.current = null;
    },
    []
  );

  const open = async (file: File) => {
    operation.current?.abort();
    preview.current?.destroy();
    preview.current = null;
    const controller = new AbortController();
    operation.current = controller;
    setError('');
    setReady(false);
    setName(file.name);
    setPhase('loading');
    try {
      const drawing = await openDwgPreview(
        file,
        container.current!,
        controller.signal,
        (next) => {
          if (operation.current === controller) setPhase(next);
        }
      );
      if (operation.current !== controller || controller.signal.aborted) {
        drawing.destroy();
        return;
      }
      preview.current = drawing;
      setReady(true);
    } catch (cause) {
      if (operation.current !== controller) return;
      const code =
        cause instanceof DrawingImportError || cause instanceof PreviewError
          ? cause.code
          : 'preview';
      setError(
        code === 'cancelled'
          ? labels.cancelled
          : (labels.errors[code] ?? labels.errors.preview)
      );
    } finally {
      if (operation.current === controller) {
        setPhase(null);
        operation.current = null;
      }
    }
  };

  return (
    <div
      data-dwg-viewer
      data-state={phase ?? (ready ? 'ready' : 'empty')}
      data-clarity-mask="true"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) void open(file);
      }}
      className={cn(
        'border-foreground/80 bg-background overflow-hidden border',
        dragging && 'ring-signal ring-2'
      )}
    >
      <input
        ref={input}
        type="file"
        accept=".dwg"
        className="sr-only"
        aria-label={labels.choose}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) void open(file);
        }}
      />
      <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b px-3 py-2 sm:px-4">
        <p className="flex min-w-0 flex-1 items-center gap-2 truncate text-sm">
          <FileIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{name || labels.empty}</span>
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!ready}
            aria-label={labels.zoomOut}
            onClick={() => preview.current?.zoom(1 / 1.25)}
            className="flex size-10 items-center justify-center border disabled:opacity-35"
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            disabled={!ready}
            aria-label={labels.zoomIn}
            onClick={() => preview.current?.zoom(1.25)}
            className="flex size-10 items-center justify-center border disabled:opacity-35"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => preview.current?.fit()}
            className="flex h-10 items-center gap-2 border px-3 text-xs font-semibold disabled:opacity-35"
          >
            <Scan className="size-4" />
            {labels.fit}
          </button>
        </div>
      </div>
      <p className="text-muted-foreground border-b px-4 py-2 text-xs leading-5">
        {labels.limits}
      </p>
      <div
        className={cn(
          'relative h-[clamp(240px,42vh,420px)]',
          ready || phase === 'rendering' ? 'bg-[#22282f]' : 'bg-sheet-grid'
        )}
      >
        <div
          ref={container}
          role="region"
          aria-label={labels.canvas}
          className="absolute inset-0 h-full w-full touch-none overflow-hidden [&_canvas]:block"
        />
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-5 text-center">
            {phase ? (
              <>
                <Loader2
                  className="text-muted-foreground size-7 animate-spin"
                  aria-hidden="true"
                />
                <p
                  role="status"
                  className={cn(
                    'text-sm',
                    phase === 'rendering' && 'text-white'
                  )}
                >
                  {labels.phases[phase]}
                </p>
                <button
                  type="button"
                  onClick={() => operation.current?.abort()}
                  className={cn(
                    'text-sm underline underline-offset-4',
                    phase === 'rendering' && 'text-white'
                  )}
                >
                  {labels.cancel}
                </button>
              </>
            ) : (
              <>
                <Upload
                  className="text-muted-foreground size-7"
                  aria-hidden="true"
                />
                <p className="font-display text-xl font-semibold">
                  {labels.uploadTitle}
                </p>
                <button
                  type="button"
                  onClick={() => input.current?.click()}
                  className={cn(ctaPrimary, 'h-11 px-5 text-sm')}
                >
                  <Upload className="size-4" />
                  {labels.choose}
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {ready && (
        <div className="flex justify-end border-t px-4 py-3 text-sm">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className={cn(ctaSecondary, 'h-10 px-3 text-xs')}
          >
            {labels.change}
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-destructive border-t px-4 py-3 text-sm">
          {error}
        </p>
      )}
      {ready && (
        <div className="space-y-1 border-t px-4 py-3 text-sm">
          <p role="status" className="flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            {labels.ready} · {labels.readOnly}
          </p>
          <p className="text-muted-foreground">{labels.hint}</p>
          <p className="text-muted-foreground text-xs leading-5">
            {labels.fidelity}
          </p>
        </div>
      )}
    </div>
  );
}
