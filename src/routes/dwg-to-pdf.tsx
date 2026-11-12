import { createFileRoute } from '@tanstack/react-router';

import { pageHead } from '@/lib/page-head';
import { CadFileToolPage } from '@/blocks/cad-file-tool-page';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { fileToolCopy } from '@/content/file-tools';

export const Route = createFileRoute('/dwg-to-pdf')({
  head: () => pageHead({ ...fileToolCopy.pdf, locale: 'en' }),
  component: Page,
});
function Page() {
  return (
    <>
      <Header />
      <main>
        <CadFileToolPage kind="pdf" />
      </main>
      <Footer />
    </>
  );
}
