import { useEffect, useRef, useState } from 'react';
import { Download, Loader2, Minus, Plus, Scan, Upload } from 'lucide-react';

import {
  exportLocalDrawing,
  toolErrorCode,
  type ToolPhase,
} from '@/lib/cad-tool-engine';
import { ctaPrimary, ctaSecondary } from '@/lib/cta';
import { cn } from '@/lib/utils';

export type LocalToolLabels = {
  accept: string;
  limits: string;
  choose: string;
  drop: string;
  change: string;
  phases: Record<ToolPhase, string>;
  cancel: string;
  fit: string;
  zoomIn: string;
  zoomOut: string;
  download: string;
  stepOne: string;
  stepTwo: string;
  ready: string;
  preview: string;
  hint: string;
  fidelity: string;
  desktop: string;
  errors: Record<string, string>;
};

export function LocalFileTool({
  output,
  labels,
}: {
  output: 'svg' | 'pdf';
  labels: LocalToolLabels;
}) {
  const input = useRef<HTMLInputElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const urlRef = useRef('');
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [phase, setPhase] = useState<ToolPhase | null>(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  useEffect(
    () => () => {
      const pending = controller.current;
      controller.current = null;
      pending?.abort();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );
  useEffect(() => {
    const el = viewport.current;
    if (!el || !url || output !== 'svg') return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const bounds = el.getBoundingClientRect(),
        x = e.clientX - bounds.left - bounds.width / 2,
        y = e.clientY - bounds.top - bounds.height / 2;
      setView((v) => {
        const scale = Math.max(
            0.125,
            Math.min(64, v.scale * Math.exp(-e.deltaY * 0.002))
          ),
          r = scale / v.scale;
        return { scale, x: x - (x - v.x) * r, y: y - (y - v.y) * r };
      });
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, [url, output]);

  const open = async (file: File) => {
    controller.current?.abort();
    const pending = new AbortController();
    controller.current = pending;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = '';
    setUrl('');
    setError('');
    setName(file.name);
    setPhase('loading');
    setView({ scale: 1, x: 0, y: 0 });
    pointers.current.clear();
    try {
      const blob = await exportLocalDrawing(
        file,
        output,
        pending.signal,
        (next) => {
          if (controller.current === pending) setPhase(next);
        }
      );
      if (pending.signal.aborted || controller.current !== pending) return;
      const localUrl = URL.createObjectURL(blob);
      urlRef.current = localUrl;
      setUrl(localUrl);
    } catch (cause) {
      if (controller.current === pending)
        setError(labels.errors[toolErrorCode(cause)] ?? labels.errors.engine);
    } finally {
      if (controller.current === pending) {
        controller.current = null;
        setPhase(null);
      }
    }
  };
  const zoom = (factor: number) =>
    setView((v) => ({
      ...v,
      scale: Math.max(0.125, Math.min(64, v.scale * factor)),
    }));
  const endPointer = (id: number) => {
    pointers.current.delete(id);
  };

  return (
    <div
      data-file-tool={output}
      data-state={phase ?? (url ? 'ready' : 'empty')}
      data-clarity-mask="true"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
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
        accept={labels.accept}
        className="sr-only"
        aria-label={labels.choose}
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          e.currentTarget.value = '';
          if (file) void open(file);
        }}
      />
      {output === 'pdf' ? (
        <ol className="grid grid-cols-2 border-b text-sm font-semibold">
          <li className="border-r px-4 py-3">1. {labels.stepOne}</li>
          <li className={cn('px-4 py-3', !url && 'text-muted-foreground')}>
            2. {labels.stepTwo}
          </li>
        </ol>
      ) : (
        <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-sm">
            {name || labels.drop}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={!url}
              aria-label={labels.zoomOut}
              onClick={() => zoom(1 / 1.25)}
              className="flex size-10 items-center justify-center border disabled:opacity-35"
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              disabled={!url}
              aria-label={labels.zoomIn}
              onClick={() => zoom(1.25)}
              className="flex size-10 items-center justify-center border disabled:opacity-35"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              disabled={!url}
              onClick={() => setView({ scale: 1, x: 0, y: 0 })}
              className="flex h-10 items-center gap-2 border px-3 text-xs disabled:opacity-35"
            >
              <Scan className="size-4" />
              {labels.fit}
            </button>
          </div>
        </div>
      )}
      <p className="text-muted-foreground border-b px-4 py-2 text-xs leading-5">
        {labels.limits}
      </p>
      <div
        ref={viewport}
        role="region"
        aria-label={labels.preview}
        className={cn(
          'bg-sheet-grid relative h-[clamp(240px,38vh,400px)] overflow-hidden',
          output === 'svg' &&
            url &&
            'cursor-grab touch-none bg-white active:cursor-grabbing'
        )}
        onPointerDown={(e) => {
          if (output !== 'svg' || !url) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }}
        onPointerMove={(e) => {
          const previous = pointers.current.get(e.pointerId);
          if (!previous) return;
          const other = [...pointers.current].find(
            ([id]) => id !== e.pointerId
          )?.[1];
          if (other) {
            const before = Math.hypot(
                previous.x - other.x,
                previous.y - other.y
              ),
              after = Math.hypot(e.clientX - other.x, e.clientY - other.y);
            if (before > 0) zoom(after / before);
          } else
            setView((v) => ({
              ...v,
              x: v.x + e.clientX - previous.x,
              y: v.y + e.clientY - previous.y,
            }));
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }}
        onPointerUp={(e) => endPointer(e.pointerId)}
        onPointerCancel={(e) => endPointer(e.pointerId)}
        onLostPointerCapture={(e) => endPointer(e.pointerId)}
      >
        {url ? (
          output === 'svg' ? (
            <img
              src={url}
              alt={labels.preview}
              draggable={false}
              className="h-full w-full object-contain select-none"
              style={{
                transform: `translate(${view.x}px,${view.y}px) scale(${view.scale})`,
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-5 text-center">
              <p role="status" className="font-semibold">
                {labels.ready}
              </p>
              <p className="max-w-full truncate text-sm">{name}</p>
              <a
                href={url}
                download={name.replace(/\.(dwg|dxf)$/i, '') + '.pdf'}
                className={cn(ctaPrimary, 'h-11 px-5 text-sm')}
              >
                <Download className="size-4" />
                {labels.download}
              </a>
            </div>
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-5 text-center">
            {phase ? (
              <>
                <Loader2 className="size-7 animate-spin" aria-hidden="true" />
                <p role="status" className="text-sm">
                  {labels.phases[phase]}
                </p>
                <button
                  type="button"
                  onClick={() => controller.current?.abort()}
                  className="text-sm underline"
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
                  {labels.drop}
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
      {error && (
        <p role="alert" className="text-destructive border-t px-4 py-3 text-sm">
          {error}{' '}
          <a href="/download" className="underline">
            {labels.desktop}
          </a>
        </p>
      )}
      {url && (
        <div className="space-y-2 border-t px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              {output === 'svg' ? labels.hint : labels.fidelity}
            </p>
            <button
              type="button"
              onClick={() => input.current?.click()}
              className={cn(ctaSecondary, 'h-10 px-3 text-xs')}
            >
              {labels.change}
            </button>
          </div>
          {output === 'svg' && (
            <p className="text-muted-foreground text-xs leading-5">
              {labels.fidelity}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
