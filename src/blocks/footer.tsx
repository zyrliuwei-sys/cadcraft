import { cadcraftLinks } from '@/config/cadcraft';
import { m } from '@/paraglide/messages.js';
import { FooterBadgeList } from '@/components/footer-badge-list';
import { SiteFooter, type FooterColumn } from '@/components/site-footer';

export function Footer() {
  const columns: FooterColumn[] = [
    {
      title: m['cad.footer.product'](),
      links: [
        { label: m['cad.nav.overview'](), href: '/' },
        { label: m['cad.nav.download'](), href: '/download' },
        { label: m['cad.nav.online'](), href: '/online' },
      ],
    },
    {
      title: m['cad.footer.learn'](),
      links: [
        { label: m['cad.nav.tutorials'](), href: '/tutorials' },
        { label: m['cad.nav.compare'](), href: '/vs-autocad' },
      ],
    },
    {
      title: m['cad.footer.project'](),
      links: [
        { label: m['cad.footer.github'](), href: cadcraftLinks.repo },
        { label: m['cad.footer.releases'](), href: cadcraftLinks.releases },
        { label: m['cad.footer.official'](), href: cadcraftLinks.official },
        { label: m['cad.footer.wiki'](), href: cadcraftLinks.wiki },
      ],
    },
    {
      title: m['cad.footer.legal'](),
      links: [
        { label: m['landing.footer.privacy'](), href: '/privacy-policy' },
        { label: m['landing.footer.terms'](), href: '/terms-of-service' },
        {
          label: m['landing.footer.aup'](),
          href: '/acceptable-use-policy',
        },
        {
          label: m['cad.footer.contact'](),
          href: 'mailto:support@cadcraft.org',
        },
      ],
    },
  ];

  return (
    <SiteFooter
      columns={columns}
      copyright={m['cad.footer.copyright']({
        year: String(new Date().getFullYear()),
      })}
      badges={<FooterBadgeList className="mt-10" />}
      disclaimer={m['cad.footer.disclaimer']()}
      signature={
        <div
          aria-hidden="true"
          className="overflow-hidden border-t px-4 sm:px-6"
        >
          <p className="font-display-wide mx-auto flex max-w-7xl items-end justify-between pt-6 text-[clamp(40px,14.2vw,228px)] leading-[0.78] font-semibold select-none">
            <span>CADCraft</span>
            <span className="snap-mark mb-[0.06em] hidden size-[0.18em]! border-[0.035em]! sm:inline-block" />
          </p>
        </div>
      }
    />
  );
}
