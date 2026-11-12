const origin = 'https://cadcraft.org';
export const languageTargets = [
  ['en', ''],
  ['it-IT', '/it'],
  ['pt-BR', '/pt'],
  ['de-DE', '/de'],
];
export const languageGroups = ['/', '/download', '/dwg-viewer'];
const urlPath = (prefix, page) => prefix + (page === '/' ? '/' : page);
function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)=["']([^"']*)["']/g)].map((m) => [
      m[1].toLowerCase(),
      m[2],
    ])
  );
}

/** An independent, explicit release matrix; no phantom translations are allowed. */
export function checkLanguagePage(html, path) {
  const errors = [];
  const group = languageGroups.find((page) =>
    languageTargets.some(([, prefix]) => urlPath(prefix, page) === path)
  );
  const head = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1] ?? '';
  const alternates = [...head.matchAll(/<link\b[^>]*>/gi)]
    .map((m) => attributes(m[0]))
    .filter((a) => a.rel === 'alternate' && a.hreflang);
  if (
    alternates.some(
      (a) =>
        !['en', 'it-IT', 'pt-BR', 'de-DE', 'x-default'].includes(a.hreflang) ||
        /\/(?:zh|ko)(?:\/|$)/.test(a.href ?? '')
    )
  )
    errors.push(`${path}: retired/unshipped hreflang`);
  const switcher =
    /<details\b[^>]*data-language-switcher[^>]*>([\s\S]*?)<\/details>/i.exec(
      html
    )?.[1];
  if (!group) {
    if (switcher) errors.push(`${path}: switcher on an English-only page`);
    if (alternates.some((a) => !['en', 'x-default'].includes(a.hreflang)))
      errors.push(`${path}: phantom language alternate`);
    return errors;
  }
  const expected = languageTargets.map(([lang, prefix]) => ({
    lang,
    href: origin + urlPath(prefix, group),
  }));
  expected.push({ lang: 'x-default', href: origin + group });
  if (
    alternates.length !== 5 ||
    expected.some(
      (x) =>
        alternates.filter((a) => a.hreflang === x.lang && a.href === x.href)
          .length !== 1
    )
  )
    errors.push(`${path}: incomplete or incorrect five-link hreflang group`);
  const locale = languageTargets.find(
    ([, prefix]) => urlPath(prefix, group) === path
  )?.[0];
  if (attributes(/<html\b[^>]*>/i.exec(html)?.[0] ?? '').lang !== locale)
    errors.push(`${path}: incorrect html lang`);
  const canonical = [...head.matchAll(/<link\b[^>]*>/gi)]
    .map((m) => attributes(m[0]))
    .find((a) => a.rel === 'canonical');
  if (canonical?.href !== origin + path)
    errors.push(`${path}: incorrect canonical`);
  if (!switcher) errors.push(`${path}: missing language switcher`);
  const anchors = [...(switcher ?? '').matchAll(/<a\b[^>]*>/gi)].map((m) =>
    attributes(m[0])
  );
  if (
    anchors.length !== 4 ||
    languageTargets.some(
      ([, prefix]) =>
        anchors.filter((a) => a.href === urlPath(prefix, group)).length !== 1
    )
  )
    errors.push(
      `${path}: language switcher does not link to all four same-page versions`
    );
  if ((html.match(/<h1\b/gi) ?? []).length !== 1)
    errors.push(`${path}: expected one H1`);
  if (group === '/dwg-viewer') {
    const types = [
      ...html.matchAll(
        /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
      ),
    ].map((m) => {
      try {
        return JSON.parse(m[1])['@type'];
      } catch {
        return null;
      }
    });
    if (
      types.filter((t) => t === 'WebApplication').length !== 1 ||
      types.filter((t) => t === 'FAQPage').length !== 1
    )
      errors.push(`${path}: viewer schemas missing or duplicated`);
  }
  return errors;
}

export function checkLanguageSitemap(xml) {
  const errors = [];
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    body: m[1],
    url: /<loc>(.*?)<\/loc>/.exec(m[1])?.[1],
  }));
  const translated = entries.filter((e) =>
    /^https:\/\/cadcraft\.org\/(?:it|pt|de)(?:\/|$)/.test(e.url ?? '')
  );
  if (translated.length !== 9)
    errors.push(
      `sitemap: expected exactly nine translated URLs, found ${translated.length}`
    );
  for (const group of languageGroups)
    for (const [, prefix] of languageTargets) {
      const url = origin + urlPath(prefix, group),
        matches = entries.filter((e) => e.url === url);
      if (matches.length !== 1) {
        errors.push(`sitemap: missing/duplicate ${url}`);
        continue;
      }
      const links = [...matches[0].body.matchAll(/<xhtml:link\b[^>]*>/g)].map(
        (m) => attributes(m[0])
      );
      if (
        links.length !== 5 ||
        languageTargets.some(
          ([lang, p]) =>
            !links.some(
              (a) =>
                a.hreflang === lang && a.href === origin + urlPath(p, group)
            )
        ) ||
        !links.some(
          (a) => a.hreflang === 'x-default' && a.href === origin + group
        )
      )
        errors.push(`sitemap: incomplete language group for ${url}`);
    }
  return errors;
}
