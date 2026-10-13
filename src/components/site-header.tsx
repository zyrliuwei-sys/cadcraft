'use client';

import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link, usePathname } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { SiteUserMenu } from '@/components/site-user-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { buttonVariants } from '@/components/ui/button';

export interface NavLink {
  href: string;
  label: string;
  /** Open in a new tab. Off-site (http) hrefs always open in a new tab. */
  external?: boolean;
}

/** Off-site URLs render as plain <a>; internal paths use the locale-aware Link. */
const isExternalHref = (href: string) => /^https?:\/\//.test(href);

export function SiteHeader({
  navLinks,
  logoAlt,
  cta,
}: {
  navLinks?: NavLink[];
  logoAlt: string;
  /** Primary button for signed-out visitors; defaults to Get Started → /settings. */
  cta?: { href: string; label: string };
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href !== '/' && (pathname === href || pathname.startsWith(`${href}/`));
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="bg-background/90 border-border sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src={envConfigs.app_logo}
            alt={logoAlt}
            width={512}
            height={512}
            className="size-7"
          />
          <span className="font-display text-[17px] font-bold">
            {envConfigs.app_name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks?.map((link) =>
            isExternalHref(link.href) ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'hover:text-foreground relative text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-foreground after:bg-signal after:absolute after:inset-x-0 after:-bottom-[22px] after:h-[2px]'
                    : 'text-foreground/80'
                )}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {user ? (
            <SiteUserMenu
              name={user.name || 'User'}
              email={user.email}
              image={user.image}
            />
          ) : (
            <Link
              href={cta?.href ?? '/settings'}
              className={cn(
                buttonVariants(),
                'h-9 gap-1.5 rounded-none px-4 text-[13px] font-semibold'
              )}
            >
              {cta?.label ?? m['common.nav.get_started']()}
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex size-10 items-center justify-center lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-border border-t px-4 pt-2 pb-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks?.map((link) =>
              isExternalHref(link.href) ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
          <div className="border-border mt-3 flex items-center gap-2 border-t pt-3">
            <ThemeToggle />
            <div className="flex-1" />
            {user ? (
              <SiteUserMenu
                name={user.name || 'User'}
                email={user.email}
                image={user.image}
              />
            ) : (
              <Link
                href={cta?.href ?? '/settings'}
                className={cn(buttonVariants(), 'gap-1.5 rounded-sm')}
                onClick={() => setMobileOpen(false)}
              >
                {cta?.label ?? m['common.nav.get_started']()}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
