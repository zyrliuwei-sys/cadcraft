import { createFileRoute, notFound } from '@tanstack/react-router';
import { MDXProvider } from '@mdx-js/react';
import { ArrowLeft, Calendar } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { pageHead } from '@/lib/page-head';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import {
  BannerAd,
  BANNERS,
  NativeAd,
  ResponsiveBannerAd,
} from '@/components/analytics/banner-ad';
import { MarkdownContent } from '@/components/markdown-content';
import { mdxComponents } from '@/components/mdx-components';
import { formatPostDate, loadLocalPost } from '@/content/posts';
import { getBlogPostFn } from '@/content/posts/server';

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const locale = getLocale();
    const post = await getBlogPostFn({
      data: { slug: params.slug, locale },
    });
    if (!post) throw notFound();
    return { locale, post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { locale, post } = loaderData;
    const head = pageHead({
      path: `/blog/${encodeURIComponent(post.slug)}`,
      locale,
      title: `${post.title} | ${envConfigs.app_name}`,
      description: post.description,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.description,
          datePublished: new Date(post.createdAt).toISOString(),
        },
        ...(post.faq?.length
          ? [
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: post.faq.map(([q, a]) => ({
                  '@type': 'Question',
                  name: q,
                  acceptedAnswer: { '@type': 'Answer', text: a },
                })),
              },
            ]
          : []),
      ],
    });
    return {
      ...head,
      meta: [...head.meta, { property: 'og:type', content: 'article' }],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { locale, post } = Route.useLoaderData();

  // Local posts render their bundled MDX component; database posts render
  // raw markdown through MarkdownContent.
  const LocalContent =
    post.source === 'local' ? loadLocalPost(post.slug, locale)?.default : null;

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-6 py-12 md:px-8 md:py-16">
        {/* xl+: ad in a sticky right rail; below xl it drops under the article. */}
        <div className="mx-auto max-w-3xl xl:grid xl:max-w-[calc(48rem+300px+3rem)] xl:grid-cols-[minmax(0,48rem)_300px] xl:gap-12">
          <article className="min-w-0">
            <Link
              href="/blog"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="size-4" />
              {m['blog.back_to_blog']()}
            </Link>

            <header className="border-border mt-8 mb-6 border-b pb-6">
              <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
                {post.title}
              </h1>
              {post.description && (
                <p className="text-muted-foreground mt-3">{post.description}</p>
              )}
              <div className="text-muted-foreground mt-4 flex items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  {formatPostDate(post.createdAt, locale)}
                </span>
                {(post.authorName || post.authorImage) && (
                  <span className="inline-flex items-center gap-2">
                    {post.authorImage && (
                      <img
                        src={post.authorImage}
                        alt={post.authorName || ''}
                        width={20}
                        height={20}
                        className="size-5 rounded-full object-cover"
                      />
                    )}
                    {post.authorName}
                  </span>
                )}
              </div>
            </header>

            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                className="border-border mb-8 w-full rounded-2xl border object-cover"
              />
            )}

            <ResponsiveBannerAd className="mb-8" />

            {LocalContent ? (
              <div className="text-foreground/90 text-[15px] leading-7">
                <MDXProvider components={mdxComponents}>
                  <LocalContent />
                </MDXProvider>
              </div>
            ) : (
              <MarkdownContent content={post.content || ''} />
            )}

            <NativeAd className="mt-12" />
          </article>
          <aside className="mt-12 xl:mt-0">
            <BannerAd
              banner={BANNERS.rect300x250}
              className="xl:sticky xl:top-24"
            />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
