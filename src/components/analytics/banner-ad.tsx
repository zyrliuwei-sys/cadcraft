import { useEffect, useRef, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';

import { NO_ADS_PATH } from '@/lib/ads';
import { cn } from '@/lib/utils';

const BANNER_HOST = 'https://bellnewyork.org/22';

export const BANNERS = {
  rect300x250: {
    key: '9b516e5489f5a83c9efad20c40c6e0cd',
    width: 300,
    height: 250,
  },
  mobile320x50: {
    key: '589a78938651891b89beed23b60fcd17',
    width: 320,
    height: 50,
  },
  skyscraper160x300: {
    key: '0ca1c4743268c33f45c654b937a8059d',
    width: 160,
    height: 300,
  },
  skyscraper160x600: {
    key: '36523b800cd31eaef0e6d42e4274bdb1',
    width: 160,
    height: 600,
  },
  banner468x60: {
    key: '4288d0c4a01cded89e2eceae1dddc514',
    width: 468,
    height: 60,
  },
  leaderboard728x90: {
    key: '54cf0bcfbde6f8edf384186687476f67',
    width: 728,
    height: 90,
  },
} as const;

type Banner = (typeof BANNERS)[keyof typeof BANNERS];

declare global {
  interface Window {
    atOptions?: Record<string, unknown>;
  }
}

// Every invoke script reads the global `atOptions` when it runs, so banners
// load one at a time: set options → append script → wait for it → next.
let queue: Promise<void> = Promise.resolve();

function loadBanner(
  el: HTMLElement,
  banner: Banner,
  isCancelled: () => boolean
) {
  queue = queue.then(
    () =>
      new Promise<void>((resolve) => {
        if (isCancelled() || !el.isConnected) return resolve();
        window.atOptions = {
          key: banner.key,
          format: 'iframe',
          height: banner.height,
          width: banner.width,
          params: {},
        };
        const script = document.createElement('script');
        script.src = `${BANNER_HOST}/${banner.key}`;
        script.onload = script.onerror = () => resolve();
        // Don't stall the queue if the network hangs.
        setTimeout(resolve, 5000);
        el.appendChild(script);
      })
  );
}

// null until mounted, then whether the viewport is at least `px` wide.
function useMinWidth(px: number | undefined) {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    if (px === undefined) return;
    const mq = window.matchMedia(`(min-width: ${px}px)`);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [px]);

  return px === undefined ? true : matches;
}

// Fixed-size iframe banner. The invoke script renders next to itself, so it
// is injected into this container on mount (and again on each client-side
// navigation, since the component remounts) instead of living in <head>.
// With `minWidth`, it only renders (and loads its script) on viewports at
// least that wide.
export function BannerAd({
  banner,
  className,
  minWidth,
}: {
  banner: Banner;
  className?: string;
  minWidth?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isNoAdsPath = useRouterState({
    select: (s) => NO_ADS_PATH.test(s.location.pathname),
  });
  const show = useMinWidth(minWidth) && !isNoAdsPath;

  useEffect(() => {
    const el = ref.current;
    if (!el || !show) return;
    let cancelled = false;
    loadBanner(el, banner, () => cancelled);
    return () => {
      cancelled = true;
      el.replaceChildren();
    };
  }, [banner, show]);

  if (!show) return null;
  return (
    <div
      ref={ref}
      style={{ width: banner.width, height: banner.height }}
      className={cn('mx-auto max-w-full overflow-hidden', className)}
    />
  );
}

// 728×90 on md+ screens, 320×50 below. Picked on the client so only one of
// the two scripts ever loads.
export function ResponsiveBannerAd({ className }: { className?: string }) {
  const wide = useMinWidth(768);

  if (wide === null) return null;
  return (
    <BannerAd
      key={wide ? 'wide' : 'narrow'}
      banner={wide ? BANNERS.leaderboard728x90 : BANNERS.mobile320x50}
      className={className}
    />
  );
}

const NATIVE_KEY = 'e05076ad36c19b6a72f58dc67a180409';

// Native banner: the script fills `#container-<key>` on load and doesn't read
// `atOptions`, so it skips the queue. Re-injected on each mount so it renders
// again after client-side navigation.
export function NativeAd({ className }: { className?: string }) {
  const isNoAdsPath = useRouterState({
    select: (s) => NO_ADS_PATH.test(s.location.pathname),
  });

  useEffect(() => {
    if (isNoAdsPath) return;
    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = `https://bellnewyork.org/21/${NATIVE_KEY}`;
    document.body.appendChild(script);
    return () => {
      script.remove();
      document.getElementById(`container-${NATIVE_KEY}`)?.replaceChildren();
    };
  }, [isNoAdsPath]);

  if (isNoAdsPath) return null;
  return <div id={`container-${NATIVE_KEY}`} className={className} />;
}
