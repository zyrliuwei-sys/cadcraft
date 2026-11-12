import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { checkLanguagePage } from '../scripts/language-check-policy.mjs';
import { SITE_URL } from '../src/config/site-url';
import { dwgViewerCopy } from '../src/content/dwg-viewer';
import { guideCopy } from '../src/content/guide-copy';
import { localizedDownloadGuides } from '../src/content/localized-download';
import { localizedDwgContent } from '../src/content/localized-dwg-viewer';
import {
  canonicalPagePath,
  canonicalRedirectUrl,
} from '../src/lib/canonical-url';
import { pageHead } from '../src/lib/page-head';
import {
  pageLanguagePath,
  pageLanguageVariants,
} from '../src/lib/site-languages';
import {
  deLocalizeUrl,
  localizeUrl,
  shouldRedirect,
} from '../src/paraglide/runtime.js';

const read = (path: string) =>
  JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const langs = [
  ['it-IT', '/it'],
  ['pt-BR', '/pt'],
  ['de-DE', '/de'],
] as const;
const pages = ['/', '/download', '/dwg-viewer'];

test('only the three shipped page groups get four reciprocal variants, preserving English URLs', () => {
  for (const page of pages) {
    const variants = pageLanguageVariants(page);
    assert.equal(variants.length, 4);
    assert.equal(pageLanguagePath(page, 'en'), page);
    for (const [locale, prefix] of langs) {
      const path = prefix + (page === '/' ? '/' : page);
      assert.equal(pageLanguagePath(page, locale), path);
      assert.equal(canonicalPagePath(path), path);
      assert.equal(canonicalRedirectUrl('https://cadcraft.org' + path), null);
      assert.equal(
        deLocalizeUrl(new URL(path, 'https://cadcraft.org')).pathname,
        page
      );
      assert.equal(
        localizeUrl(new URL(page, 'https://cadcraft.org'), { locale }).pathname,
        path
      );
      const head = pageHead({
        path: page,
        locale,
        title: 'Title',
        description: 'Description',
      });
      assert.equal(head.links.filter((l) => l.rel === 'alternate').length, 5);
      assert.equal(
        head.links.find((l) => l.rel === 'canonical')?.href,
        SITE_URL + path
      );
    }
  }
  for (const page of [
    '/online',
    '/dxf-viewer',
    '/dwg-to-pdf',
    '/about',
    '/blog/a',
    '/privacy-policy',
    '/terms-of-service',
    '/acceptable-use-policy',
    '/contact',
  ]) {
    assert.equal(pageLanguageVariants(page).length, 0, page);
    assert.equal(pageLanguagePath(page, 'de-DE'), page);
    assert.equal(
      localizeUrl(new URL(page, 'https://cadcraft.org'), { locale: 'it-IT' })
        .pathname,
      page
    );
    assert.deepEqual(
      pageHead({ path: page, locale: 'en', title: 'T', description: 'D' })
        .links.filter((l) => l.rel === 'alternate')
        .map((l) => (l as { hrefLang: string }).hrefLang),
      ['en', 'x-default']
    );
  }
});

test('cookies and Accept-Language cannot redirect English or override an explicit language URL', async () => {
  for (const path of [
    '/',
    '/download',
    '/dwg-viewer',
    '/de/',
    '/it/download',
    '/pt/dwg-viewer',
  ])
    for (const preferred of ['de-DE', 'it-IT', 'pt-BR', 'ko-KR', 'zh']) {
      const result = await shouldRedirect({
        request: new Request('https://cadcraft.org' + path, {
          headers: {
            'Accept-Language': preferred,
            cookie: `PARAGLIDE_LOCALE=${preferred}`,
          },
        }),
      });
      assert.equal(result.shouldRedirect, false, path + ' ' + preferred);
      assert.equal(
        result.locale,
        path.startsWith('/de/')
          ? 'de-DE'
          : path.startsWith('/it/')
            ? 'it-IT'
            : path.startsWith('/pt/')
              ? 'pt-BR'
              : 'en'
      );
    }
  assert.equal(
    canonicalRedirectUrl('https://cadcraft.org/zh/'),
    'https://cadcraft.org/'
  );
});

test('translated messages cover the full shared templates and preserve numeric facts and placeholders', () => {
  const en = read('messages/en.json');
  const postPreviews = read('src/content/home-post-previews.json');
  const postRegistry = readFileSync(
    new URL('../src/content/posts/index.ts', import.meta.url),
    'utf8'
  )
    .split('export const BLOG_POST_SLUGS = [')[1]
    .split('] as const')[0];
  const postSlugs = [...postRegistry.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const numbers = (value: string) =>
    [...new Set(value.match(/(?<![A-Za-z])\d+(?:[.,]\d+)*/g) || [])].sort();
  const fields = (value: string) => (value.match(/\{\w+\}/g) || []).sort();
  const requiredFiles = [
    'blocks/cad-sections.tsx',
    'blocks/cad-download-page.tsx',
    'blocks/cad-doc.tsx',
    'blocks/header.tsx',
    'blocks/footer.tsx',
    'blocks/home-hero-actions.tsx',
    'blocks/home-ads.tsx',
    'blocks/blog.tsx',
    'components/site-header.tsx',
    'components/theme-toggle.tsx',
    'components/code-block.tsx',
    'components/site-user-menu.tsx',
    'routes/index.tsx',
    'routes/download.tsx',
    'blocks/cad-guide-content.tsx',
  ];
  for (const [locale] of langs) {
    const dict = read(`messages/${locale}.json`);
    for (const slug of postSlugs)
      assert.ok(
        postPreviews[locale][slug]?.title,
        locale + ' missing home preview ' + slug
      );
    for (const file of requiredFiles) {
      const source = readFileSync(
        new URL('../src/' + file, import.meta.url),
        'utf8'
      );
      for (const m of source.matchAll(/m\['([^']+)'\]/g))
        assert.ok(dict[m[1]], locale + ' ' + m[1]);
    }
    for (const [key, value] of Object.entries(dict) as [string, string][]) {
      assert.deepEqual(numbers(value), numbers(en[key]), locale + ' ' + key);
      assert.deepEqual(fields(value), fields(en[key]), locale + ' ' + key);
      if (
        en[key].split(' ').length >= 4 &&
        !['home.spec.files_v'].includes(key)
      )
        assert.notEqual(value, en[key], locale + ' untranslated ' + key);
      assert.ok(!/[\uac00-\ud7af]/.test(value));
    }
    assert.equal(
      localizedDownloadGuides[locale].paragraphs.length,
      guideCopy.download!.paragraphs.length
    );
    assert.equal(
      localizedDownloadGuides[locale].faq.length,
      guideCopy.download!.faq.length
    );
    const viewer = localizedDwgContent(locale)!;
    assert.ok(viewer);
    assert.deepEqual(
      Object.keys(viewer.copy).sort(),
      Object.keys(dwgViewerCopy).sort()
    );
    assert.deepEqual(
      Object.keys(viewer.copy.errors).sort(),
      Object.keys(dwgViewerCopy.errors).sort()
    );
    assert.match(viewer.copy.limits, /20 MB/);
    assert.match(viewer.copy.errors.too_large, /64 MB/);
    assert.equal(viewer.body.faq.length, 4);
    assert.equal(viewer.body.comparison.length, 4);
    assert.equal(viewer.faqSchema.mainEntity.length, 4);
    assert.ok(viewer.copy.title.length <= 60);
    assert.notEqual(viewer.copy.title, dwgViewerCopy.title);
  }
  assert.equal(
    en['common.metadata.title'],
    'CADCraft: Free Open-Source AutoCAD Alternative | ArtCraft CADCraft'
  );
  assert.equal(
    en['home.hero.title'],
    'CADCraft: free, open-source CAD for people and AI agents'
  );
});

test('language policy rejects missing reciprocal alternates, wrong switcher targets and phantom pages', () => {
  const base = '/download';
  const variants = [['en', ''], ...langs];
  const links =
    variants
      .map(
        ([lang, prefix]) =>
          `<link rel="alternate" hreflang="${lang}" href="https://cadcraft.org${prefix}${base}">`
      )
      .join('') +
    '<link rel="alternate" hreflang="x-default" href="https://cadcraft.org/download">';
  const body = `<details data-language-switcher><nav>${variants.map(([, prefix]) => `<a href="${prefix}${base}">Language</a>`).join('')}</nav></details><h1>Herunterladen</h1>`;
  const html = `<html lang="de-DE"><head><link rel="canonical" href="https://cadcraft.org/de/download">${links}</head><body>${body}</body></html>`;
  assert.deepEqual(checkLanguagePage(html, '/de/download'), []);
  assert.ok(
    checkLanguagePage(
      html.replace('hreflang="en"', 'hreflang="zh"'),
      '/de/download'
    ).length > 0
  );
  assert.ok(
    checkLanguagePage(
      html.replace('href="/it/download"', 'href="/it/"'),
      '/de/download'
    ).length > 0
  );
  assert.ok(
    checkLanguagePage(html.replace('x-default', 'invalid'), '/de/download')
      .length > 0
  );
  assert.ok(checkLanguagePage(html, '/blog/example').length > 0);
});
