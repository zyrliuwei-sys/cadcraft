import { envConfigs } from '@/config';
import { locales, localizeUrl } from '@/paraglide/runtime.js';

type Locale = (typeof locales)[number];

/** Title/description/OG + canonical and hreflang links for a public page. */
export function pageHead({
  path,
  locale,
  title,
  description,
  jsonLd,
}: {
  path: string;
  locale: string;
  title: string;
  description: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}) {
  const urlFor = (loc: string) =>
    localizeUrl(`${envConfigs.app_url}${path}`, { locale: loc as Locale }).href;
  const image = `${envConfigs.app_url}/og-image.jpg`;
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: urlFor(locale) },
      { property: 'og:image', content: image },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'canonical', href: urlFor(locale) },
      ...locales.map((loc) => ({
        rel: 'alternate',
        hrefLang: loc,
        href: urlFor(loc),
      })),
      { rel: 'alternate', hrefLang: 'x-default', href: urlFor('en') },
    ],
    scripts: (Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []).map(
      (data) => ({
        type: 'application/ld+json',
        children: JSON.stringify(data),
      })
    ),
  };
}
