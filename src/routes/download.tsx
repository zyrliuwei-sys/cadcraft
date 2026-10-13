import { createFileRoute } from '@tanstack/react-router';

import { pageHead } from '@/lib/page-head';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { CadDownloadPage } from '@/blocks/cad-download-page';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { ScrollProgress } from '@/components/scroll-progress';

export const Route = createFileRoute('/download')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['cad.page.download.title']({}, { locale }),
      description: m['cad.page.download.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData ? pageHead({ path: '/download', ...loaderData }) : {},
  component: Page,
});

function Page() {
  return (
    <>
      <Header />
      <ScrollProgress />
      <main>
        <CadDownloadPage />
      </main>
      <Footer />
    </>
  );
}
