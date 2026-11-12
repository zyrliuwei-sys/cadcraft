import { createFileRoute } from '@tanstack/react-router';

import { pageHead } from '@/lib/page-head';
import { CadFileToolPage } from '@/blocks/cad-file-tool-page';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { fileToolCopy } from '@/content/file-tools';

export const Route = createFileRoute('/dxf-viewer')({
  head: () => pageHead({ ...fileToolCopy.dxf, locale: 'en' }),
  component: Page,
});
function Page() {
  return (
    <>
      <Header />
      <main>
        <CadFileToolPage kind="dxf" />
      </main>
      <Footer />
    </>
  );
}
