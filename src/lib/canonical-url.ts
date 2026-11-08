const PRODUCTION_HOSTS = new Set(['cadcraft.org', 'www.cadcraft.org']);

/** Public page paths have no trailing slash; keep the origin's root slash. */
export function canonicalPagePath(path: string): string {
  const boundary = path.search(/[?#]/);
  const pathname = boundary < 0 ? path : path.slice(0, boundary);
  const suffix = boundary < 0 ? '' : path.slice(boundary);
  return (pathname.replace(/\/+$/, '') || '/') + suffix;
}

/** Apply the page form after localization (which may reintroduce a slash). */
export function canonicalPageUrl(value: string): string {
  const url = new URL(value);
  url.pathname = canonicalPagePath(url.pathname);
  return url.href;
}

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
  // Asset directories and API endpoints have their own routing semantics.
  if (!/^\/(?:api|assets|cadcraft-app)(?:\/|$)/.test(url.pathname)) {
    url.pathname = canonicalPagePath(url.pathname);
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
