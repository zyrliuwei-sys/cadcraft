import { useEffect, useRef, useState, type RefObject } from 'react';
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
type AdStatus = 'loading' | 'filled' | 'failed';
type AdProps = {
  className?: string;
  label?: string;
  placement?: string;
};

const RESPONSIVE_BANNERS = [
  BANNERS.leaderboard728x90,
  BANNERS.banner468x60,
  BANNERS.mobile320x50,
];
const CREATIVE_TIMEOUT_MS = 12_000;

declare global {
  interface Window {
    atOptions?: Record<string, unknown>;
  }
}

// Every invoke script reads the global `atOptions` when it runs, so banners
// load one at a time: set options → append script → wait for it → next.
let queue: Promise<void> = Promise.resolve();

function loadBanner(el: HTMLElement, banner: Banner, onError: () => void) {
  let cancelled = false;
  let cancelActive: (() => void) | undefined;
  queue = queue
    .catch(() => {})
    .then(
      () =>
        new Promise<void>((resolve) => {
          if (cancelled || !el.isConnected) return resolve();
          window.atOptions = {
            key: banner.key,
            format: 'iframe',
            height: banner.height,
            width: banner.width,
            params: {},
          };
          const script = document.createElement('script');
          script.src = `${BANNER_HOST}/${banner.key}`;
          script.dataset.cfasync = 'false';
          let finished = false;
          const finish = (failed: boolean) => {
            if (finished) return;
            finished = true;
            window.clearTimeout(timer);
            script.onload = script.onerror = null;
            if (failed) {
              script.remove();
              if (!cancelled) onError();
            }
            resolve();
          };
          const timer = window.setTimeout(() => finish(true), 5000);
          script.onload = () => finish(false);
          script.onerror = () => finish(true);
          cancelActive = () => {
            script.remove();
            finish(false);
          };
          el.appendChild(script);
        })
    );

  return () => {
    cancelled = true;
    cancelActive?.();
  };
}

// A downloaded script is not proof that an ad rendered. Collapse the entire
// placement (including its margins and label) on errors or an empty response.
function watchCreative(el: HTMLElement, onStatus: (status: AdStatus) => void) {
  let settled = false;
  const cleanup = () => {
    window.clearTimeout(timer);
    observer.disconnect();
    el.removeEventListener('load', check, true);
  };
  const finish = (status: AdStatus) => {
    if (settled) return;
    settled = true;
    cleanup();
    onStatus(status);
  };
  const check = () => {
    const hasCreative = [
      ...el.querySelectorAll('iframe, img, video, a[href]'),
    ].some((node) => {
      const rect = node.getBoundingClientRect();
      return rect.width > 1 && rect.height > 1;
    });
    if (hasCreative) finish('filled');
  };
  const observer = new MutationObserver(check);
  const timer = window.setTimeout(() => finish('failed'), CREATIVE_TIMEOUT_MS);
  observer.observe(el, { childList: true, subtree: true, attributes: true });
  el.addEventListener('load', check, true);
  return { cleanup, fail: () => finish('failed') };
}

function useContainerWidth(
  ref: RefObject<HTMLDivElement | null>,
  enabled: boolean
) {
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const update = () => setWidth(Math.floor(el.clientWidth));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, ref]);
  return width;
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
function BannerSlot({
  banners,
  className,
  minWidth,
  label,
  placement,
}: {
  banners: readonly Banner[];
  minWidth?: number;
} & AdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });
  const show = !!useMinWidth(minWidth) && !NO_ADS_PATH.test(pathname);
  const width = useContainerWidth(containerRef, show);
  const banner =
    width === null ? undefined : banners.find((b) => b.width <= width);
  const [status, setStatus] = useState<AdStatus>('loading');

  // A shared footer can survive route changes. Reopen its container before
  // measuring again; a failed hidden placement otherwise remains zero wide.
  useEffect(() => setStatus('loading'), [pathname, show]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !show || !banner) return;
    setStatus('loading');
    const creative = watchCreative(el, setStatus);
    const cancel = loadBanner(el, banner, creative.fail);
    return () => {
      creative.cleanup();
      cancel();
      el.replaceChildren();
    };
  }, [banner, show, pathname]);

  if (!show) return null;
  return (
    <div
      ref={containerRef}
      data-ad-placement={placement}
      data-ad-status={status}
      data-ad-format={banner ? `${banner.width}x${banner.height}` : undefined}
      style={{
        display: status === 'failed' ? 'none' : undefined,
        marginBlock: width !== null && !banner ? 0 : undefined,
      }}
      className={cn('mx-auto w-full max-w-full', className)}
    >
      {label && (width === null || banner) && (
        <p className="text-muted-foreground mb-2 text-center font-mono text-[10px] tracking-widest uppercase">
          {label}
        </p>
      )}
      <div
        ref={ref}
        className="mx-auto overflow-hidden"
        style={{ width: banner?.width, height: banner?.height }}
      />
    </div>
  );
}

export function BannerAd({
  banner,
  ...props
}: { banner: Banner; minWidth?: number } & AdProps) {
  return <BannerSlot banners={[banner]} {...props} />;
}

// Select by the space available to this placement, not the window: a wide
// screen can still have a narrow article column. Only the chosen script loads.
export function ResponsiveBannerAd(props: AdProps) {
  return <BannerSlot banners={RESPONSIVE_BANNERS} {...props} />;
}

const NATIVE_KEY = 'e05076ad36c19b6a72f58dc67a180409';

// Native banner: the script fills `#container-<key>` on load and doesn't read
// `atOptions`, so it skips the queue. Re-injected on each mount so it renders
// again after client-side navigation.
export function NativeAd({ className, label, placement }: AdProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<AdStatus>('loading');
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });
  const isNoAdsPath = NO_ADS_PATH.test(pathname);

  useEffect(() => {
    const el = ref.current;
    if (isNoAdsPath || !el) return;
    setStatus('loading');
    const script = document.createElement('script');
    const creative = watchCreative(el, (nextStatus) => {
      setStatus(nextStatus);
      if (nextStatus === 'failed') script.remove();
    });
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = `https://bellnewyork.org/21/${NATIVE_KEY}`;
    script.onerror = creative.fail;
    el.after(script);
    return () => {
      creative.cleanup();
      script.onerror = null;
      script.remove();
      el.replaceChildren();
    };
  }, [isNoAdsPath, pathname]);

  if (isNoAdsPath) return null;
  return (
    <div
      className={className}
      data-ad-placement={placement}
      data-ad-status={status}
      style={{ display: status === 'failed' ? 'none' : undefined }}
    >
      {label && (
        <p className="text-muted-foreground mb-3 text-center font-mono text-[10px] tracking-widest uppercase">
          {label}
        </p>
      )}
      <div ref={ref} id={`container-${NATIVE_KEY}`} />
    </div>
  );
}
