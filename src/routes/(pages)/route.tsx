import { createFileRoute, Outlet } from '@tanstack/react-router';
import { MDXProvider } from '@mdx-js/react';

import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { mdxComponents } from '@/components/mdx-components';

export const Route = createFileRoute('/(pages)')({
  component: PagesLayout,
});

function PagesLayout() {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-6 pt-10 pb-12 md:px-8 md:pt-14 md:pb-16">
        <MDXProvider components={mdxComponents}>
          <Outlet />
        </MDXProvider>
      </main>
      <Footer ad={false} />
    </div>
  );
}
