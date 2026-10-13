import { useEffect, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Eyebrow } from '@/blocks/cad-sections';

/** Drafting-sheet band at the top of inner pages. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
  aside,
}: {
  eyebrow?: string;
  title: string;
  lead: string;
  children?: ReactNode;
  /** Right-hand visual on large screens (real image or real data). */
  aside?: ReactNode;
}) {
  return (
    <section className="bg-sheet-grid border-b">
      <div
        className={cn(
          'mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-14 sm:px-6 lg:pt-20 lg:pb-20 [&>*]:min-w-0',
          aside && 'lg:grid-cols-[1.25fr_1fr] lg:gap-16'
        )}
      >
        <div className="reveal is-visible">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="font-display rise-in max-w-4xl text-4xl leading-[1.06] font-semibold text-balance sm:text-5xl lg:text-[58px]">
            {title}
          </h1>
          <p className="text-muted-foreground rise-in-2 mt-6 max-w-[62ch] text-lg leading-relaxed">
            {lead}
          </p>
          <div className="rise-in-3">{children}</div>
        </div>
        {aside && <div className="rise-in-3">{aside}</div>}
      </div>
    </section>
  );
}

/** Sticky table of contents + content column. */
export function DocLayout({
  tocTitle,
  toc,
  children,
}: {
  tocTitle: string;
  toc: { id: string; label: string }[];
  children: ReactNode;
}) {
  const [active, setActive] = useState(toc[0]?.id);
  const ids = toc.map((t) => t.id).join('|');
  useEffect(() => {
    const els = ids
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-80px 0px -65% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[240px_1fr] lg:gap-20 lg:py-20">
      <aside className="hidden lg:block">
        <nav className="sticky top-24">
          <p className="text-muted-foreground mb-4 font-mono text-[11px] tracking-[0.08em] uppercase">
            {tocTitle}
          </p>
          <ul className="border-l">
            {toc.map((t) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  aria-current={active === t.id ? 'location' : undefined}
                  className={cn(
                    'hover:text-foreground -ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors',
                    active === t.id
                      ? 'border-signal text-foreground font-medium'
                      : 'text-foreground/65 border-transparent'
                  )}
                >
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="max-w-3xl min-w-0 space-y-16">{children}</div>
    </div>
  );
}

export function DocSection({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('scroll-mt-24', className)}>
      <h2 className="font-display border-foreground/80 border-b pb-3 text-2xl font-semibold sm:text-[28px]">
        {title}
      </h2>
      <div className="text-foreground/85 mt-6 space-y-4 text-[16px] leading-7">
        {children}
      </div>
    </section>
  );
}

/** Ordered steps with square, outlined counters. */
export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-4">
          <span className="border-foreground/80 flex size-7 shrink-0 items-center justify-center border font-mono text-[13px] font-semibold">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">{item}</div>
        </li>
      ))}
    </ol>
  );
}
