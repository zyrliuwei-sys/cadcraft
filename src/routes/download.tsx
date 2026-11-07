import { createFileRoute } from '@tanstack/react-router';

import { CADCRAFT_VERSION } from '@/config/cadcraft';
import { pageHead } from '@/lib/page-head';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { CadDownloadPage } from '@/blocks/cad-download-page';
import { CadGuideContent } from '@/blocks/cad-guide-content';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { ScrollProgress } from '@/components/scroll-progress';
import { guideFaqJsonLd } from '@/content/guide-copy';

export const Route = createFileRoute('/download')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['cad.page.download.title']({}, { locale }),
      description: m['cad.page.download.description'](
        { version: CADCRAFT_VERSION },
        { locale }
      ),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead({
          path: '/download',
          ...loaderData,
          jsonLd: guideFaqJsonLd('download'),
        })
      : {},
  component: Page,
});

function Page() {
  return (
    <>
      <Header />
      <ScrollProgress />
      <main>
        <CadDownloadPage />
        <CadGuideContent page="download" />
      </main>
      <Footer />
    </>
  );
}
