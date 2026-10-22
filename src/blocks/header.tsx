import { m } from '@/paraglide/messages.js';
import { SiteHeader } from '@/components/site-header';

export function Header() {
  const navLinks = [
    { href: '/download', label: m['cad.nav.download']() },
    { href: '/online', label: m['cad.nav.online']() },
    { href: '/tutorials', label: m['cad.nav.tutorials']() },
    { href: '/vs-autocad', label: m['cad.nav.compare']() },
    { href: '/pricing', label: m['cad.nav.pricing']() },
  ];

  return (
    <SiteHeader
      navLinks={navLinks}
      logoAlt={m['cad.logo_alt']()}
      cta={{ href: '/online', label: m['cad.nav.cta']() }}
    />
  );
}
