import { createFileRoute } from '@tanstack/react-router';

import { pageHead } from '@/lib/page-head';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { CadOnlinePage } from '@/blocks/cad-online-page';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';

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
    loaderData ? pageHead({ path: '/online', ...loaderData }) : {},
  component: Page,
});

function Page() {
  return (
    <>
      <Header />
      <main>
        <CadOnlinePage />
      </main>
      <Footer />
    </>
  );
}
