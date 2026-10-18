import { useEffect, useRef, useState } from 'react';
import { Info, Lock, Maximize2, Smartphone } from 'lucide-react';

import { cadcraftLinks } from '@/config/cadcraft';
import { ctaPrimary } from '@/lib/cta';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { CodeBlock } from '@/components/code-block';

type Renderer = '' | '?webgl' | '?cpu';

// Phones get the full desktop UI: render the app at this width, then scale it
// down to fit, instead of letting the toolbars and panels collapse onto each other.
const MOBILE_BREAKPOINT = 768;
const VIRTUAL_WIDTH = 1024;

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
      const { width, height } = el.getBoundingClientRect();
      if (window.innerWidth >= MOBILE_BREAKPOINT || width >= VIRTUAL_WIDTH) {
        setBox(null);
        return;
      }
      const scale = width / VIRTUAL_WIDTH;
      setBox({ scale, height: height / scale });
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
  const src = `${cadcraftLinks.app}${renderer}`;
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
              className={cn(ctaPrimary, 'h-9 px-4 text-sm')}
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
          className="relative h-[70vh] min-h-[480px] w-full overflow-hidden border-y bg-[#22282f] sm:h-[calc(100vh-200px)] sm:min-h-[560px] sm:border"
        >
          {measured && (
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
                      transform: `scale(${box.scale})`,
                      transformOrigin: '0 0',
                    }
                  : undefined
              }
              allow="fullscreen; clipboard-read; clipboard-write"
              allowFullScreen
            />
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
