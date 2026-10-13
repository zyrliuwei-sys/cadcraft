import type { ComponentType, ReactNode, SVGProps } from 'react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { cn } from '@/lib/utils';

export interface FooterColumn {
  title: string;
  /** external: open in a new tab. Off-site (http) hrefs always open in a new tab. */
  links: { label: string; href: string; external?: boolean }[];
}

/** Off-site URLs render as plain <a>; internal paths use the locale-aware Link. */
const isExternalHref = (href: string) => /^(https?:\/\/|mailto:)/.test(href);

export interface FooterSocial {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href: string;
  label: string;
}

export function SiteFooter({
  tagline,
  columns,
  socials,
  copyright,
  badges,
  disclaimer,
  signature,
}: {
  tagline?: string;
  columns?: FooterColumn[];
  socials?: FooterSocial[];
  copyright?: string;
  /** Rendered above the socials row, e.g. admin-managed footer badges. */
  badges?: ReactNode;
  /** Small print under the bottom bar, e.g. a trademark notice. */
  disclaimer?: string;
  /** Full-width brand moment rendered at the very bottom. */
  signature?: ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background text-foreground border-foreground/80 border-t">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-8 sm:px-6 sm:pt-20">
        {tagline && (
          <p className="font-display mb-12 max-w-3xl text-3xl leading-[1.1] font-semibold sm:text-[44px]">
            {tagline}
          </p>
        )}

        {columns && columns.length > 0 && (
          <div
            className={cn(
              'grid gap-x-8 gap-y-10 sm:gap-x-12',
              columns.length <= 3
                ? 'grid-cols-2 sm:grid-cols-3'
                : columns.length === 4
                  ? 'grid-cols-2 sm:grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            )}
          >
            {columns.map((col) => (
              <div key={col.title} className="space-y-5">
                <p className="text-muted-foreground font-mono text-[11px] tracking-[0.08em] uppercase">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {isExternalHref(link.href) ? (
                        <a
                          href={link.href}
                          target={
                            link.href.startsWith('mailto:')
                              ? undefined
                              : '_blank'
                          }
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {badges}

        {/* Social links */}
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {socials && socials.length > 0 ? (
            <div className="flex items-center gap-5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <s.icon className="size-[18px]" />
                </a>
              ))}
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-border mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground text-sm">
            {copyright ||
              `© ${year} ${envConfigs.app_name}. All rights reserved.`}
          </span>
        </div>
        {disclaimer && (
          <p className="text-muted-foreground mt-4 max-w-4xl text-xs leading-5">
            {disclaimer}
          </p>
        )}
      </div>
      {signature}
    </footer>
  );
}
