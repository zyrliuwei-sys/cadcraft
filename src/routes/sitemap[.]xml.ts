import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { baseLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { getLocalPosts } from '@/content/posts';

const STATIC_PATHS = [
  '',
  '/download',
  '/online',
  '/tutorials',
  '/vs-autocad',
  '/pricing',
  '/blog',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
  '/acceptable-use-policy',
];

type Entry = {
  path: string;
  lastModified?: string;
  changeFrequency: string;
  priority: number;
};

function urlFor(path: string, locale: string): string {
  return localizeUrl(`${envConfigs.app_url}${path || '/'}`, {
    locale: locale as (typeof locales)[number],
  }).href;
}

function xmlEscape(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[char]!
  );
}

// One <url> per language version, each listing every alternate (Google's
// recommended hreflang form). The site is English-only, so this yields one
// <loc> per page with en + x-default alternates.
function entryXml(e: Entry): string {
  const alternates = [
    ...locales.map(
      (loc) =>
        `    <xhtml:link rel="alternate" hreflang="${loc}" href="${xmlEscape(urlFor(e.path, loc))}"/>`
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(urlFor(e.path, baseLocale))}"/>`,
  ].join('\n');
  return locales
    .map((loc) =>
      [
        '  <url>',
        `    <loc>${xmlEscape(urlFor(e.path, loc))}</loc>`,
        alternates,
        e.lastModified ? `    <lastmod>${e.lastModified}</lastmod>` : null,
        `    <changefreq>${e.changeFrequency}</changefreq>`,
        `    <priority>${e.priority}</priority>`,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n')
    )
    .join('\n');
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const entries: Entry[] = STATIC_PATHS.map((path) => ({
          path,
          changeFrequency: path === '/blog' ? 'daily' : 'weekly',
          priority: path === '' ? 1 : path === '/blog' ? 0.7 : 0.8,
        }));

        // Local project articles are published content and use the same
        // hreflang entry format as the static pages.
        const localPosts = getLocalPosts(baseLocale);
        const knownPostSlugs = new Set<string>();
        for (const post of localPosts) {
          knownPostSlugs.add(post.slug);
          entries.push({
            path: `/blog/${encodeURIComponent(post.slug)}`,
            lastModified: post.createdAt,
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }

        // Add published database articles without duplicating a local article.
        try {
          const { listPublishedArticles } =
            await import('@/modules/posts/service');
          const rows = await listPublishedArticles().catch(() => []);
          for (const post of rows) {
            if (knownPostSlugs.has(post.slug)) continue;
            entries.push({
              path: `/blog/${encodeURIComponent(post.slug)}`,
              lastModified: new Date(post.createdAt).toISOString(),
              changeFrequency: 'monthly',
              priority: 0.6,
            });
          }
        } catch {
          // Database unreachable — keep the static project pages.
        }

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...entries.map(entryXml),
          '</urlset>',
          '',
        ].join('\n');

        return new Response(xml, {
          headers: { 'Content-Type': 'application/xml' },
        });
      },
    },
  },
});
