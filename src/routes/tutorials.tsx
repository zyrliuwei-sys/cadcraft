import { createFileRoute } from '@tanstack/react-router';

import { pageHead } from '@/lib/page-head';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { CadTutorialsPage } from '@/blocks/cad-tutorials-page';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { ScrollProgress } from '@/components/scroll-progress';

export const Route = createFileRoute('/tutorials')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['cad.page.tutorials.title']({}, { locale }),
      description: m['cad.page.tutorials.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData ? pageHead({ path: '/tutorials', ...loaderData }) : {},
  component: Page,
});

function Page() {
  return (
    <>
      <Header />
      <ScrollProgress />
      <main>
        <CadTutorialsPage />
      </main>
      <Footer />
    </>
  );
}
