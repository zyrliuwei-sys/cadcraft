import { createFileRoute } from '@tanstack/react-router';

import { SITE_URL } from '@/config/site-url';
import { pageHead } from '@/lib/page-head';
import { CadDwgViewerPage } from '@/blocks/cad-dwg-viewer-page';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { dwgViewerCopy, dwgViewerFaqJsonLd } from '@/content/dwg-viewer';

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
  head: () =>
    pageHead({
      path: '/dwg-viewer',
      locale: 'en',
      title: dwgViewerCopy.title,
      description: dwgViewerCopy.description,
    }),
  component: Page,
});

function Page() {
  return (
    <>
      <Header />
      <main>
        {/* Keep distinct JSON-LD bodies out of head-script deduplication. Both are SSR HTML. */}
        <script
          id="dwg-viewer-web-application"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialize(application) }}
        />
        <script
          id="dwg-viewer-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialize(dwgViewerFaqJsonLd()) }}
        />
        <CadDwgViewerPage />
      </main>
      <Footer />
    </>
  );
}
