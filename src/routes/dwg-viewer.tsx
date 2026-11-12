import { createFileRoute } from '@tanstack/react-router';

import { SITE_URL } from '@/config/site-url';
import { pageHead } from '@/lib/page-head';
import { pageLanguagePath } from '@/lib/site-languages';
import { getLocale } from '@/paraglide/runtime.js';
import { CadDwgViewerPage } from '@/blocks/cad-dwg-viewer-page';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { LocalizedDwgViewerPage } from '@/blocks/localized-dwg-viewer-page';
import { dwgViewerCopy, dwgViewerFaqJsonLd } from '@/content/dwg-viewer';
import { localizedDwgContent } from '@/content/localized-dwg-viewer';

const application = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'DWG viewer',
  url: `${SITE_URL}/dwg-viewer`,
  description: dwgViewerCopy.description,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web browser',
  browserRequirements: 'WebAssembly and WebGL2 support',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};
const serialize = (data: object) =>
  JSON.stringify(data).replace(/</g, '\\u003c');

export const Route = createFileRoute('/dwg-viewer')({
  head: () => {
    const translated = localizedDwgContent(getLocale());
    return pageHead({
      path: '/dwg-viewer',
      locale: getLocale(),
      title: translated?.copy.title ?? dwgViewerCopy.title,
      description: translated?.copy.description ?? dwgViewerCopy.description,
    });
  },
  component: Page,
});

function Page() {
  const translated = localizedDwgContent(getLocale());
  const app = translated
    ? {
        ...application,
        name: translated.copy.h1,
        description: translated.copy.description,
        url: `${SITE_URL}${pageLanguagePath('/dwg-viewer', getLocale())}`,
        inLanguage: getLocale(),
        operatingSystem:
          getLocale() === 'pt-BR'
            ? 'Navegador'
            : getLocale() === 'it-IT'
              ? 'Browser'
              : 'Webbrowser',
        browserRequirements:
          getLocale() === 'pt-BR'
            ? 'Requer WebAssembly e WebGL2'
            : getLocale() === 'it-IT'
              ? 'Richiede WebAssembly e WebGL2'
              : 'WebAssembly und WebGL2 erforderlich',
      }
    : application;
  return (
    <>
      <Header />
      <main>
        {/* Keep distinct JSON-LD bodies out of head-script deduplication. Both are SSR HTML. */}
        <script
          id="dwg-viewer-web-application"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialize(app) }}
        />
        <script
          id="dwg-viewer-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serialize(translated?.faqSchema ?? dwgViewerFaqJsonLd()),
          }}
        />
        {translated ? <LocalizedDwgViewerPage /> : <CadDwgViewerPage />}
      </main>
      <Footer />
    </>
  );
}
