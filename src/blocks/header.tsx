import { cadcraftLinks } from '@/config/cadcraft';
import { m } from '@/paraglide/messages.js';
import { SiteHeader } from '@/components/site-header';

export function Header() {
  const navLinks = [
    { href: '/download', label: m['cad.nav.download']() },
    { href: '/online', label: m['cad.nav.online']() },
    { href: '/tutorials', label: m['cad.nav.tutorials']() },
    { href: '/vs-autocad', label: m['cad.nav.compare']() },
    { href: '/blog', label: m['cad.nav.blog']() },
    { href: '/about', label: m['cad.nav.about']() },
    { href: '/contact', label: m['cad.nav.contact']() },
    { href: cadcraftLinks.repo, label: m['cad.nav.github']() },
  ];

  return (
    <SiteHeader
      navLinks={navLinks}
      logoAlt={m['cad.logo_alt']()}
      cta={{ href: '/online', label: m['cad.nav.cta']() }}
    />
  );
}
