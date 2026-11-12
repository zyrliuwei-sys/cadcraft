// Test fixtures, dependencies and maintenance reports are not published pages.
// Keep the policy here so the scanner does not flag its own forbidden literals.
export const retiredVersions = ['0.8.0'];
export const forbiddenAds = [/bellnewyork/i, /\batOptions\b/, /adsterra/i];
export const drawCommands =
  'LINE CIRCLE OFFSET TRIM FILLET HATCH DIMLINEAR BLOCK PLOT ZOOM';

export const sourceRoots = ['src', 'messages', 'public', 'pages', 'content'];
export const textExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.map',
  '.md',
  '.mdx',
  '.html',
  '.xml',
  '.svg',
  '.txt',
  '.css',
  '.yaml',
  '.yml',
]);

export function checkText(text, label) {
  const issues = [];
  for (const pattern of forbiddenAds) {
    if (pattern.test(text))
      issues.push(`${label}: forbidden ad code ${pattern.source}`);
  }
  for (const version of retiredVersions) {
    const pattern = new RegExp(
      '(?<![\\d.])' + version.replaceAll('.', '\\.') + '(?!\\d|\\.\\d)'
    );
    if (pattern.test(text))
      issues.push(`${label}: retired CADCraft version ${version}`);
  }
  // Includes escaped JSON URLs as well as ordinary HTML/MDX links.
  if (/http:(?:\\?\/){2}(?:www\.)?cadcraft\.org(?=[:/\\"'\s<]|$)/i.test(text)) {
    issues.push(`${label}: insecure cadcraft.org URL`);
  }
  return issues;
}

function attrs(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map((m) => [
      m[1].toLowerCase(),
      m[3],
    ])
  );
}

export function plainText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkPage(html, path) {
  const issues = checkText(html, path);
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)]
    .map((m) => attrs(m[0]))
    .filter((a) => /(?:^|\/)adsbygoogle\.js(?:\?|$)/.test(a.src ?? ''));
  if (scripts.length > 1)
    issues.push(`${path}: ${scripts.length} adsbygoogle.js loaders`);
  if (/\bCADCraft AI\b/.test(plainText(html)))
    issues.push(`${path}: retired site branding`);

  for (const tag of html.matchAll(/<(?:a|link|meta)\b[^>]*>/gi)) {
    const a = attrs(tag[0]);
    const value = a.href ?? (a.property === 'og:url' ? a.content : undefined);
    if (
      !value ||
      !/^(?:\/(?!\/)|https?:\/\/(?:www\.)?cadcraft\.org(?:\/|$))/.test(value)
    )
      continue;
    const url = new URL(value, 'https://cadcraft.org');
    if (
      url.pathname !== '/' &&
      !/^\/(?:pt|it|de)\/$/.test(url.pathname) &&
      url.pathname.endsWith('/')
    ) {
      issues.push(`${path}: trailing slash in page URL ${value}`);
    }
  }

  function checkStructuredUrl(value) {
    if (
      typeof value === 'string' &&
      /^https?:\/\/(?:www\.)?cadcraft\.org(?:\/|$)/.test(value)
    ) {
      const url = new URL(value);
      if (
        url.pathname !== '/' &&
        !/^\/(?:pt|it|de)\/$/.test(url.pathname) &&
        url.pathname.endsWith('/')
      )
        issues.push(`${path}: trailing slash in JSON-LD URL ${value}`);
    } else if (value && typeof value === 'object') {
      for (const entry of Object.values(value)) checkStructuredUrl(entry);
    }
  }
  for (const script of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      checkStructuredUrl(JSON.parse(script[1]));
    } catch {
      issues.push(`${path}: invalid JSON-LD`);
    }
  }

  if (path === '/') {
    const text = plainText(html);
    const occurrences = text.split(drawCommands).length - 1;
    if (occurrences !== 1)
      issues.push(
        `/: Draw command strip occurs ${occurrences} times; expected once`
      );
  }
  return issues;
}

export function checkSitemap(xml) {
  const issues = checkText(xml, 'sitemap.xml');
  const urls = [
    ...xml.matchAll(/<(?:loc)>([^<]+)<\/loc>|\bhref="([^"]+)"/g),
  ].map((m) => m[1] ?? m[2]);
  if (!urls.length) issues.push('sitemap.xml: no URLs');
  for (const value of urls) {
    const url = new URL(value.replaceAll('&amp;', '&'));
    if (
      url.pathname !== '/' &&
      !/^\/(?:pt|it|de)\/$/.test(url.pathname) &&
      url.pathname.endsWith('/')
    )
      issues.push(`sitemap.xml: trailing slash ${value}`);
  }
  return issues;
}
