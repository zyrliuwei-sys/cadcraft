declare const __BUILD_VERSION__: string;

type Props = Record<string, string | number>;

/**
 * Fire a funnel event to whichever analytics the admin enabled (GA4 and/or
 * Plausible) and to our own event table (modules/analytics), which the
 * admin funnel reads. A no-op on the server.
 */
export function track(
  name: string,
  props?: Props,
  opts?: { variant?: string }
) {
  if (typeof window === 'undefined') return;
  const w = window as any;
  try {
    w.gtag?.('event', name, props);
    w.plausible?.(name, props ? { props } : undefined);
  } catch {
    // Analytics must never break the page.
  }
  record(name, props, opts?.variant);
}

/** Page view for our own funnel only (GA/Plausible count their own). */
export function trackPageView() {
  if (typeof window === 'undefined') return;
  record('page_view');
}

// ─── First-party event queue ────────────────────────────────────────────────

const VID_KEY = 'cc_vid';
const FT_KEY = 'cc_ft';
const INTERNAL_KEY = 'cc_internal';

type Queued = {
  name: string;
  path: string;
  props?: Props;
  variant?: string;
  ts: number;
};

const queue: Queued[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;
let memoryVid: string | undefined;
let memoryFt: Record<string, string> | undefined;

function store(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function visitorId() {
  const s = store();
  let vid: string | null | undefined = memoryVid;
  try {
    vid ||= s?.getItem(VID_KEY);
  } catch {}
  if (!vid) {
    vid = crypto.randomUUID?.() ?? `${Date.now()}${Math.random()}`.slice(2);
    try {
      s?.setItem(VID_KEY, vid);
    } catch {}
  }
  return (memoryVid = vid);
}

/** Where a visitor came from: utm_source, ad click id, or referrer host. */
function classifySource(url: URL, referrer: string) {
  const utm = url.searchParams.get('utm_source')?.toLowerCase();
  if (utm) return utm.includes('chatgpt') ? 'chatgpt' : utm.slice(0, 64);
  if (url.searchParams.has('gclid')) return 'google_ads';
  if (!referrer) return 'direct';
  let host = '';
  try {
    host = new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return 'direct';
  }
  if (host === url.hostname.replace(/^www\./, '')) return 'direct';
  const known: [RegExp, string][] = [
    [/chatgpt\.com|openai\.com/, 'chatgpt'],
    [/perplexity\./, 'perplexity'],
    [/claude\.ai/, 'claude'],
    [/gemini\.google/, 'gemini'],
    [/copilot\.microsoft/, 'copilot'],
    [/(^|\.)google\./, 'google'],
    [/bing\.com/, 'bing'],
    [/duckduckgo\./, 'duckduckgo'],
    [/yandex\./, 'yandex'],
    [/baidu\./, 'baidu'],
    [/youtube\.|youtu\.be/, 'youtube'],
    [/reddit\./, 'reddit'],
    [/(^|\.)(x|twitter)\.com$|^t\.co$/, 'x'],
    [/facebook\.|instagram\./, 'meta'],
  ];
  return known.find(([re]) => re.test(host))?.[1] ?? host.slice(0, 64);
}

/** Origin + path only: other sites' query strings can carry personal data. */
function referrerWithoutQuery(referrer: string) {
  try {
    const u = new URL(referrer);
    return (u.origin + u.pathname).slice(0, 200);
  } catch {
    return '';
  }
}

/** First touch, kept forever: the funnel buckets visitors by it. */
function firstTouch() {
  if (memoryFt) return memoryFt;
  const s = store();
  try {
    const saved = s?.getItem(FT_KEY);
    if (saved) return (memoryFt = JSON.parse(saved));
  } catch {}
  const url = new URL(window.location.href);
  memoryFt = {
    source: classifySource(url, document.referrer),
    referrer: referrerWithoutQuery(document.referrer),
    landing: url.pathname.slice(0, 200),
  };
  try {
    s?.setItem(FT_KEY, JSON.stringify(memoryFt));
  } catch {}
  return memoryFt;
}

/** Admins and test devices: `?internal=1` once, or opening /admin. */
function isInternal() {
  const s = store();
  try {
    const url = new URL(window.location.href);
    if (
      url.searchParams.get('internal') === '1' ||
      /(^|\/)admin(\/|$)/.test(url.pathname)
    ) {
      s?.setItem(INTERNAL_KEY, '1');
    }
    return s?.getItem(INTERNAL_KEY) === '1';
  } catch {
    return false;
  }
}

function record(name: string, props?: Props, variant?: string) {
  try {
    // Capture first touch before any client-side navigation changes the URL.
    firstTouch();
    queue.push({
      name,
      path: window.location.pathname.slice(0, 200),
      props,
      variant,
      ts: Date.now(),
    });
    if (queue.length >= 20) flush();
    else timer ??= setTimeout(flush, 1000);
    listen();
  } catch {}
}

function flush() {
  clearTimeout(timer);
  timer = undefined;
  while (queue.length) {
    const body = JSON.stringify({
      vid: visitorId(),
      build: __BUILD_VERSION__,
      internal: isInternal() || undefined,
      ft: firstTouch(),
      events: queue.splice(0, 20),
    });
    try {
      const blob = new Blob([body], { type: 'application/json' });
      if (!navigator.sendBeacon?.('/api/events', blob)) {
        void fetch('/api/events', {
          method: 'POST',
          body,
          keepalive: true,
          headers: { 'content-type': 'application/json' },
        }).catch(() => {});
      }
    } catch {}
  }
}

let listening = false;
function listen() {
  if (listening) return;
  listening = true;
  // Navigations (sign-up redirect, Stripe checkout) must not drop the queue.
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}
