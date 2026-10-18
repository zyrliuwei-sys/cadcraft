import { useEffect, useRef, useState } from 'react';
import { Info, Lock, Maximize2, Minus, Plus, Smartphone } from 'lucide-react';

import { cadcraftLinks } from '@/config/cadcraft';
import { ctaPrimary } from '@/lib/cta';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { CodeBlock } from '@/components/code-block';

type Renderer = '' | '?webgl' | '?cpu';

// Keep the reference desktop layout and scale the entire editor on every screen.
const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = (VIRTUAL_WIDTH * 1358) / 2182;

function useFitScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ scale: number; height: number } | null>(
    null
  );
  // Hold the iframe until measured so phones don't boot the app twice.
  const [measured, setMeasured] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setMeasured(true);
      const scale = el.clientWidth / VIRTUAL_WIDTH;
      if (!scale) return;
      setBox({ scale, height: el.clientHeight / scale });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, box, measured };
}

export function CadOnlinePage() {
  const [renderer, setRenderer] = useState<Renderer>('');
  const [uiZoom, setUiZoom] = useState(1);
  const src = `${cadcraftLinks.app}${renderer}${renderer ? '&' : '?'}ui=2`;
  const { ref: frameBoxRef, box, measured } = useFitScale();

  const renderers: [Renderer, string][] = [
    ['', m['cad.online.render_auto']()],
    ['?webgl', m['cad.online.render_webgl']()],
    ['?cpu', m['cad.online.render_cpu']()],
  ];

  const tips = [
    ['line 0,0 @10,0 @0,5 c', m['cad.online.tip1']()],
    ['circle 5,2 1', m['cad.online.tip2']()],
    ['offset 0.25', m['cad.online.tip3']()],
    ['zoom e', m['cad.online.tip4']()],
  ];

  return (
    <>
      <section className="bg-sheet-grid border-b">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">
              {m['cad.online.h1']()}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {m['cad.online.lead']()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex items-center border"
              role="group"
              aria-label={m['cad.online.ui_zoom']()}
            >
              <button
                type="button"
                className="flex size-10 items-center justify-center disabled:opacity-40"
                aria-label={m['cad.online.zoom_out']()}
                disabled={uiZoom <= 1}
                onClick={() => setUiZoom((zoom) => Math.max(1, zoom - 0.25))}
              >
                <Minus className="size-4" />
              </button>
              <button
                type="button"
                className="h-10 min-w-14 px-2 text-xs font-semibold"
                onClick={() => setUiZoom(1)}
                aria-label={m['cad.online.zoom_fit']()}
              >
                {Math.round(uiZoom * 100)}%
              </button>
              <button
                type="button"
                className="flex size-10 items-center justify-center disabled:opacity-40"
                aria-label={m['cad.online.zoom_in']()}
                disabled={uiZoom >= 3}
                onClick={() => setUiZoom((zoom) => Math.min(3, zoom + 0.25))}
              >
                <Plus className="size-4" />
              </button>
            </div>
            <div className="flex border p-0.5" role="group">
              {renderers.map(([value, label]) => (
                <button
                  key={value || 'auto'}
                  type="button"
                  onClick={() => setRenderer(value)}
                  aria-pressed={renderer === value}
                  className={cn(
                    'rounded-[2px] px-3 py-1.5 text-xs font-semibold transition-colors',
                    renderer === value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <a
              href={src}
              target="_blank"
              rel="noopener"
              className={cn(
                ctaPrimary,
                'hidden h-9 px-4 text-sm md:inline-flex'
              )}
            >
              <Maximize2 className="size-4" />
              {m['cad.online.fullscreen']()}
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-0 sm:px-6 sm:py-4">
        <p className="text-muted-foreground flex items-center gap-2 px-4 py-3 text-sm md:hidden">
          <Smartphone className="size-4 shrink-0" />
          {m['cad.online.mobile_note']()}
        </p>
        <div
          ref={frameBoxRef}
          className="relative w-full overflow-auto border-y bg-[#22282f] sm:border"
          style={{ aspectRatio: `${VIRTUAL_WIDTH} / ${VIRTUAL_HEIGHT}` }}
        >
          {measured && box && (
            <div
              className="relative"
              style={{
                width: VIRTUAL_WIDTH * box.scale * uiZoom,
                height: box.height * box.scale * uiZoom,
              }}
            >
              <iframe
                key={`${src}${box ? '#fit' : ''}`}
                src={src}
                data-fit={box ? '1' : undefined}
                title="CADCraft"
                className="absolute top-0 left-0 block h-full w-full"
                style={
                  box
                    ? {
                        width: VIRTUAL_WIDTH,
                        height: box.height,
                        transform: `scale(${box.scale * uiZoom})`,
                        transformOrigin: '0 0',
                      }
                    : undefined
                }
                allow="fullscreen; clipboard-read; clipboard-write"
                allowFullScreen
              />
            </div>
          )}
        </div>
        <p className="text-muted-foreground px-4 pt-2 text-xs sm:px-0">
          {m['cad.online.loading_note']()} {m['cad.online.license']()}
        </p>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div>
          <h2 className="font-display text-2xl font-semibold">
            {m['cad.online.tips_title']()}
          </h2>
          <div className="mt-6 space-y-4">
            {tips.map(([code, label]) => (
              <div key={code}>
                <p className="mb-1.5 text-sm font-semibold">{label}</p>
                <CodeBlock code={code} />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-sm border p-6">
            <h3 className="font-display flex items-center gap-2 font-semibold">
              <Info className="size-4" />
              {m['cad.online.render_title']()}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {m['cad.online.render_desc']()}
            </p>
            <ul className="mt-4 space-y-2 font-mono text-sm">
              <li className="flex flex-wrap items-baseline gap-x-3">
                <a
                  className="text-signal-ink hover:underline"
                  href={`${cadcraftLinks.app}?webgl`}
                  target="_blank"
                  rel="noopener"
                >
                  /cadcraft-app/?webgl
                </a>
                <span className="text-muted-foreground font-sans">
                  {m['cad.online.render_webgl']()}
                </span>
              </li>
              <li className="flex flex-wrap items-baseline gap-x-3">
                <a
                  className="text-signal-ink hover:underline"
                  href={`${cadcraftLinks.app}?cpu`}
                  target="_blank"
                  rel="noopener"
                >
                  /cadcraft-app/?cpu
                </a>
                <span className="text-muted-foreground font-sans">
                  {m['cad.online.render_cpu']()}
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-sheet-grid border p-6">
            <h3 className="font-display flex items-center gap-2 font-semibold">
              <Lock className="size-4" />
              {m['cad.online.privacy_title']()}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {m['cad.online.privacy']()}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
