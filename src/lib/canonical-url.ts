const PRODUCTION_HOSTS = new Set(['cadcraft.org', 'www.cadcraft.org']);

/** Combine protocol, host and retired-locale redirects into one destination. */
export function canonicalRedirectUrl(requestUrl: string): string | null {
  const url = new URL(requestUrl);
  if (PRODUCTION_HOSTS.has(url.hostname)) {
    url.protocol = 'https:';
    url.hostname = 'cadcraft.org';
    url.port = '';
  } else if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.slice(4);
  }
  if (/^\/zh(?:\/|$)/.test(url.pathname)) {
    url.pathname = url.pathname.replace(/^\/zh/, '') || '/';
  }
  return url.href === requestUrl ? null : url.href;
}

/** Normalize the configured public origin without forcing HTTPS on localhost. */
export function canonicalSiteOrigin(configuredUrl: string): string {
  const url = new URL(configuredUrl);
  if (PRODUCTION_HOSTS.has(url.hostname)) {
    url.protocol = 'https:';
    url.hostname = 'cadcraft.org';
    url.port = '';
  }
  return url.origin;
}
