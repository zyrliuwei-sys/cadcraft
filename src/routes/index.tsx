import { createFileRoute } from '@tanstack/react-router';

import { CADCRAFT_VERSION, cadcraftLinks } from '@/config/cadcraft';
import { siteAuthorJsonLd } from '@/config/site-author';
import { SITE_URL } from '@/config/site-url';
import { pageHead } from '@/lib/page-head';
import { pageLanguagePath } from '@/lib/site-languages';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { Blog } from '@/blocks/blog';
import {
  CadAgents,
  CadArtCraft,
  CadCompareTeaser,
  CadCta,
  CadDownload,
  CadFaq,
  CadFeatures,
  CadHero,
  CadLearn,
  CadMarquee,
  CadTitleBlock,
  CadWhatIs,
  faqItems,
} from '@/blocks/cad-sections';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { HomeNativeAd } from '@/blocks/home-ads';
import { getBlogPostsFn } from '@/content/posts/server';

export const Route = createFileRoute('/')({
  loader: async () => {
    const locale = getLocale();
    const posts = await getBlogPostsFn({ data: { locale } });
    return { locale, posts };
  },
  head: ({ loaderData }) => {
    const heroPreload = {
      rel: 'preload',
      as: 'image',
      type: 'image/webp',
      imageSrcSet:
        '/imgs/cadcraft/cadcraft-drawing-640.webp 640w, /imgs/cadcraft/cadcraft-drawing-960.webp 960w, /imgs/cadcraft/cadcraft-drawing.webp 1680w',
      imageSizes: '(min-width: 1280px) 1232px, 100vw',
      fetchPriority: 'high' as const,
    };
    const locale = loaderData?.locale ?? 'en';
    const title = m['common.metadata.title']({}, { locale: locale as any });
    const description = m['common.metadata.description'](
      {},
      { locale: locale as any }
    );
    const head = pageHead({
      path: '/',
      locale,
      title,
      description,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            url: `${SITE_URL}${pageLanguagePath('/', locale)}`,
            name: title,
            author: siteAuthorJsonLd(),
            description,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'CADCraft',
            alternateName: 'ArtCraft CADCraft',
            image: `${SITE_URL}/imgs/cadcraft/cadcraft-drawing.webp`,
            applicationCategory: 'DesignApplication',
            operatingSystem: 'Windows, macOS, Linux, FreeBSD, Web',
            softwareVersion: CADCRAFT_VERSION,
            license: [
              'https://opensource.org/licenses/MIT',
              'https://opensource.org/licenses/Apache-2.0',
            ],
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            downloadUrl: cadcraftLinks.releases,
            url: cadcraftLinks.official,
            description,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems().map(([q, a]) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          },
        ],
      },
    });
    return { ...head, links: [heroPreload, ...head.links] };
  },
  component: HomePage,
});

function HomePage() {
  const { posts } = Route.useLoaderData();

  return (
    <>
      <Header />
      <main>
        <CadHero />
        <CadTitleBlock />
        <CadWhatIs />
        <HomeNativeAd />
        <CadFeatures />
        <CadMarquee />
        <CadArtCraft />
        <CadAgents />
        <CadCompareTeaser />
        <CadDownload />
        <CadLearn />
        <Blog posts={posts} />
        <CadFaq />
        <CadCta />
      </main>
      <Footer />
    </>
  );
}
