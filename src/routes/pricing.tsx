import { createFileRoute } from '@tanstack/react-router';

import { pageHead } from '@/lib/page-head';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { CadPricingPage } from '@/blocks/cad-pricing-page';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';

export const Route = createFileRoute('/pricing')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['cad.page.pricing.title']({}, { locale }),
      description: m['cad.page.pricing.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData ? pageHead({ path: '/pricing', ...loaderData }) : {},
  component: Page,
});

function Page() {
  return (
    <>
      <Header />
      <main>
        <CadPricingPage />
      </main>
      <Footer ad={false} />
    </>
  );
}
