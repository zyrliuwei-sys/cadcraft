import { useEffect } from 'react';
import { useRouterState } from '@tanstack/react-router';

import { track, trackPageView } from '@/lib/track';

const PLATFORMS: [RegExp, string][] = [
  [/\.msi$|windows/i, 'windows'],
  [/\.dmg$|macos/i, 'macos'],
  [/\.flatpak$|linux/i, 'linux'],
  [/cadcraft-web-.*\.zip$/i, 'web_zip'],
  [/craft-launcher/i, 'launcher'],
  [/\/releases\/(tag|latest)/i, 'releases'],
];

/** Funnel event for a clicked link, or null when it isn't one we count. */
function linkEvent(href: string): [string, Record<string, string>] | null {
  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  if (url.origin === window.location.origin) {
    return url.pathname.startsWith('/cadcraft-app')
      ? ['online_app_click', {}]
      : null;
  }
  const target = url.hostname + url.pathname;
  // Checksums and source links aren't installs.
  const platform = /\.txt$/i.test(url.pathname)
    ? undefined
    : PLATFORMS.find(([re]) => re.test(target))?.[1];
  if (platform && url.hostname.endsWith('github.com')) {
    return ['download_click', { platform }];
  }
  return ['outbound_click', { host: url.hostname }];
}

/**
 * Records a `page_view` in our own funnel on load and on every navigation,
 * plus download / outbound clicks from any link on the site.
 */
export function PageViewTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]');
      const event = a && linkEvent(a.getAttribute('href') || '');
      if (event) track(...event);
    };
    // Capture phase so links that navigate away are still counted.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
