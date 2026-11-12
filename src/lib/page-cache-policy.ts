const LANGUAGE_PATH = /^\/(?:pt|it|de)(?:\/|$)/;
const ENGLISH_PAGE_PATHS = new Set(['/', '/download', '/dwg-viewer']);

/** Keep redirects and the localized page groups out of downstream caches. */
export function applyPageCachePolicy(
  request: Request,
  response: Response
): Response {
  const path = new URL(request.url).pathname;
  const redirect = response.status >= 300 && response.status < 400;
  const page =
    response.headers.get('Content-Type')?.includes('text/html') &&
    (LANGUAGE_PATH.test(path) || ENGLISH_PAGE_PATHS.has(path));
  if (!redirect && !page) return response;

  // Response.redirect() has immutable headers. Copy them rather than mutating
  // the original, and cover canonical redirects before the SSR handler runs.
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'private, no-store, max-age=0');
  headers.set('CDN-Cache-Control', 'no-store');
  headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
  headers.set('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT');
  headers.delete('Surrogate-Control');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
