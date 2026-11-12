import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { BlogCard } from '@/components/blog-card';
import previews from '@/content/home-post-previews.json';
import { formatPostDate, type BlogPost } from '@/content/posts';

export function Blog({ posts }: { posts: BlogPost[] }) {
  const locale = getLocale();

  if (posts.length === 0) return null;

  const translations = previews[locale as keyof typeof previews] as
    | Record<string, { title: string; description?: string }>
    | undefined;
  const translatedPosts = translations
    ? posts.map((post) => ({
        ...post,
        title: translations[post.slug]?.title ?? m['landing.blog.title'](),
        description:
          translations[post.slug]?.description ??
          m['landing.blog.description'](),
      }))
    : posts;
  const featuredPosts = translatedPosts.slice(0, 3);
  const olderPosts = translatedPosts.slice(3);

  return (
    <section id="blog" className="px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-20 text-center">
          <h2 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
            {m['landing.blog.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-lg">
            {m['landing.blog.description']()}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.map((post) => (
            <BlogCard
              key={post.slug}
              href={`/blog/${post.slug}`}
              title={post.title}
              description={post.description}
              image={post.cover ?? post.image}
              date={
                locale === 'en'
                  ? formatPostDate(post.createdAt, locale)
                  : new Intl.DateTimeFormat(locale, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }).format(new Date(post.createdAt))
              }
              authorName={post.authorName}
              authorImage={post.authorImage}
            />
          ))}
        </div>
        {olderPosts.length > 0 && (
          <details className="border-border mt-8 border-y py-4">
            <summary className="text-foreground cursor-pointer text-sm font-medium">
              {m['landing.blog.more_posts']()}
            </summary>
            <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {olderPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-muted-foreground hover:text-foreground text-sm hover:underline"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        )}
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            {m['landing.blog.view_all']()}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
