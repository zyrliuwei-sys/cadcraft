import { createFileRoute } from '@tanstack/react-router';

import { pageHead } from '@/lib/page-head';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { CadComparePage } from '@/blocks/cad-compare-page';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';

export const Route = createFileRoute('/vs-autocad')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['cad.page.compare.title']({}, { locale }),
      description: m['cad.page.compare.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData ? pageHead({ path: '/vs-autocad', ...loaderData }) : {},
  component: Page,
});

function Page() {
  return (
    <>
      <Header />
      <main>
        <CadComparePage />
      </main>
      <Footer />
    </>
  );
}
