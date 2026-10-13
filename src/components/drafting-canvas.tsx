import { useEffect, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

const GRID = 40;
const SNAP_RADIUS = 10;

/**
 * Section wrapper that behaves like a CAD model space: a full-bleed crosshair
 * follows a fine pointer, an orange snap marker locks onto grid points, and a
 * status-bar readout shows the cursor position in grid units. Purely
 * decorative (aria-hidden); disabled for touch and reduced motion.
 */
export function DraftingCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const hRef = useRef<HTMLDivElement>(null);
  const vRef = useRef<HTMLDivElement>(null);
  const snapRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || still) return;

    let frame = 0;
    let px = 0;
    let py = 0;

    const paint = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const x = px - rect.left;
      const y = py - rect.top;
      const gx = Math.round(x / GRID) * GRID;
      const gy = Math.round(y / GRID) * GRID;
      const snapped = Math.hypot(gx - x, gy - y) < SNAP_RADIUS;
      const cx = snapped ? gx : x;
      const cy = snapped ? gy : y;
      hRef.current!.style.transform = `translate3d(0, ${cy}px, 0)`;
      vRef.current!.style.transform = `translate3d(${cx}px, 0, 0)`;
      snapRef.current!.style.transform = `translate3d(${gx - 6}px, ${gy - 6}px, 0)`;
      snapRef.current!.style.opacity = snapped ? '1' : '0';
      const ux = (cx / GRID).toFixed(4);
      const uy = ((rect.height - cy) / GRID).toFixed(4);
      readoutRef.current!.textContent = `${ux}, ${uy}, 0.0000`;
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      layerRef.current!.dataset.active = 'true';
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      layerRef.current!.dataset.active = 'false';
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className={cn('relative overflow-hidden', className)}
    >
      <div
        ref={layerRef}
        data-active="false"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 data-[active=true]:opacity-100"
      >
        <div
          ref={hRef}
          className="bg-foreground/25 absolute top-0 left-0 h-px w-full will-change-transform"
        />
        <div
          ref={vRef}
          className="bg-foreground/25 absolute top-0 left-0 h-full w-px will-change-transform"
        />
        <div
          ref={snapRef}
          className="border-signal absolute top-0 left-0 size-3 border-2 opacity-0 transition-opacity duration-100 will-change-transform"
        />
        <span
          ref={readoutRef}
          className="text-muted-foreground bg-background/80 absolute right-4 bottom-3 px-1.5 py-0.5 font-mono text-[11px] tabular-nums backdrop-blur-sm sm:right-6"
        />
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}
