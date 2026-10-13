import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Wraps a block of text and draws a live CAD-style linear dimension above it:
 * extension ticks, arrowheads and the measured width (CSS px, two decimals),
 * kept current with a ResizeObserver. The number is real, not decoration.
 */
export function DimensionLine({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    const measure = () => {
      // Width of the longest rendered line, not the box.
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = Array.from(range.getClientRects());
      const w = rects.length
        ? Math.max(...rects.map((r) => r.width))
        : el.offsetWidth;
      setWidth(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, []);

  return (
    <div className={cn('relative', className)}>
      <div
        aria-hidden="true"
        className="dim-draw text-signal-ink mb-3 flex h-5 items-center font-mono text-[11px] tabular-nums"
        style={{ width: width ? `${width}px` : '100%' }}
      >
        <span className="bg-signal h-4 w-px" />
        <span className="h-0 w-0 border-y-[4px] border-r-[8px] border-y-transparent border-r-current" />
        <span className="bg-signal h-px flex-1" />
        <span className="px-2">{width ? width.toFixed(2) : ''}</span>
        <span className="bg-signal h-px flex-1" />
        <span className="h-0 w-0 border-y-[4px] border-l-[8px] border-y-transparent border-l-current" />
        <span className="bg-signal h-4 w-px" />
      </div>
      <div ref={targetRef}>{children}</div>
    </div>
  );
}
