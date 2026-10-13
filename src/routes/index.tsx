import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { CADCRAFT_VERSION, cadcraftLinks } from '@/config/cadcraft';
import { pageHead } from '@/lib/page-head';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
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

export const Route = createFileRoute('/')({
  loader: () => ({ locale: getLocale() }),
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
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'CADCraft',
          alternateName: 'ArtCraft CADCraft',
          author: { '@type': 'Organization', name: 'ArtCraft' },
          image: `${envConfigs.app_url}/imgs/cadcraft/cadcraft-drawing.webp`,
          applicationCategory: 'DesignApplication',
          operatingSystem: 'Windows, macOS, Linux, FreeBSD, Web',
          softwareVersion: CADCRAFT_VERSION,
          license: 'https://opensource.org/licenses/MIT',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          downloadUrl: cadcraftLinks.releases,
          url: envConfigs.app_url,
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
    });
    return { ...head, links: [heroPreload, ...head.links] };
  },
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <CadHero />
        <CadTitleBlock />
        <CadWhatIs />
        <CadFeatures />
        <CadMarquee />
        <CadArtCraft />
        <CadAgents />
        <CadCompareTeaser />
        <CadDownload />
        <CadLearn />
        <CadFaq />
        <CadCta />
      </main>
      <Footer />
    </>
  );
}
