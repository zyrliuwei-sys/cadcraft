import { useEffect, useRef } from 'react';

import { DEFAULT_ADSENSE_CODE } from '@/config';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    adsbygoogle?: { push: (request: Record<string, never>) => unknown };
  }
}

type Props = {
  placement: 'home-hero' | 'home-intro';
  slot: string;
  format: 'banner' | 'rectangle';
  label: string;
  className?: string;
};

export function AdSenseUnit({
  placement,
  slot,
  format,
  label,
  className,
}: Props) {
  const unit = useRef<HTMLModElement>(null);
  const requested = useRef(false);
  const configured = /^\d+$/.test(slot);

  useEffect(() => {
    // Do not submit an invalid unit while waiting for the account's real ID.
    // The ref also prevents duplicate requests during Strict Mode effects.
    if (!configured || !unit.current || requested.current) return;
    requested.current = true;
    try {
      const queue = window.adsbygoogle ?? ([] as Record<string, never>[]);
      window.adsbygoogle = queue;
      queue.push({});
    } catch {
      // Blocked ads or an unapproved account must not break page navigation.
    }
  }, [configured]);

  const dimensions =
    format === 'banner'
      ? `.adsense-${placement}{display:block;width:250px;height:250px;margin:0 auto;text-decoration:none}@media(min-width:640px){.adsense-${placement}{width:468px;height:60px}}@media(min-width:1024px){.adsense-${placement}{width:728px;height:90px}}`
      : `.adsense-${placement}{display:block;width:250px;height:250px;margin:0 auto;text-decoration:none}`;

  return (
    <>
      <style>{dimensions}</style>
      <div
        className={cn('text-center', className)}
        data-ad-placement={placement}
      >
        <p className="text-muted-foreground mb-2 font-mono text-[10px] tracking-widest uppercase">
          {label}
        </p>
        {/* Fixed dimensions at each breakpoint reserve space before ads load. */}
        <ins
          ref={unit}
          className={`adsbygoogle adsense-${placement}`}
          data-ad-client={DEFAULT_ADSENSE_CODE}
          data-ad-slot={configured ? slot : undefined}
        />
      </div>
    </>
  );
}
