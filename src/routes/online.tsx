import { createFileRoute } from '@tanstack/react-router';

import { pageHead } from '@/lib/page-head';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { CadGuideContent } from '@/blocks/cad-guide-content';
import { CadOnlinePage } from '@/blocks/cad-online-page';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { guideFaqJsonLd } from '@/content/guide-copy';

export const Route = createFileRoute('/online')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['cad.page.online.title']({}, { locale }),
      description: m['cad.page.online.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead({
          path: '/online',
          ...loaderData,
          jsonLd: guideFaqJsonLd('online'),
        })
      : {},
  component: Page,
});

function Page() {
  return (
    <>
      <Header />
      <main>
        <CadOnlinePage />
        <CadGuideContent page="online" />
      </main>
      <Footer />
    </>
  );
}
