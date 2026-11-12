import { usePathname } from '@/core/i18n/navigation';
import { pageLanguageVariants } from '@/lib/site-languages';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { SiteHeader } from '@/components/site-header';

export function Header() {
  const variants = pageLanguageVariants(usePathname());
  const navLinks = [
    { href: '/download', label: m['cad.nav.download']() },
    { href: '/online', label: m['cad.nav.online']() },
    { href: '/tutorials', label: m['cad.nav.tutorials']() },
    { href: '/blog', label: m['cad.nav.blog']() },
    { href: '/vs-autocad', label: m['cad.nav.compare']() },
    { href: '/pricing', label: m['cad.nav.pricing']() },
  ];

  return (
    <SiteHeader
      navLinks={navLinks}
      logoAlt={m['cad.logo_alt']()}
      cta={{ href: '/online', label: m['cad.nav.cta']() }}
      languageLinks={variants.map((v) => ({
        href: v.path,
        label: v.label,
        locale: v.locale,
        current: v.locale === getLocale(),
      }))}
      languageLabel={
        getLocale() === 'pt-BR'
          ? 'Idioma'
          : getLocale() === 'it-IT'
            ? 'Lingua'
            : getLocale() === 'de-DE'
              ? 'Sprache'
              : 'Language'
      }
    />
  );
}
