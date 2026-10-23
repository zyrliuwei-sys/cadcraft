import { cadcraftLinks } from '@/config/cadcraft';
import { m } from '@/paraglide/messages.js';
import { FooterBadgeList } from '@/components/footer-badge-list';
import { SiteFooter, type FooterColumn } from '@/components/site-footer';

// 姊妹站导流栏暂时下线：不渲染进 HTML，避免被爬虫抓到。恢复时改回 true。
const SHOW_SISTER_GUIDES = false;

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
        { label: m['cad.nav.blog'](), href: '/blog' },
      ],
    },
    {
      title: m['cad.footer.project'](),
      links: [
        { label: m['cad.footer.github'](), href: cadcraftLinks.repo },
        { label: m['cad.footer.releases'](), href: cadcraftLinks.releases },
        { label: m['cad.footer.official'](), href: cadcraftLinks.official },
      ],
    },
    ...(SHOW_SISTER_GUIDES
      ? [
          {
            title: m['cad.footer.guides'](),
            links: [
              {
                label: m['cad.footer.guide_wordcraft'](),
                href: 'https://wordcraftapp.com',
              },
              {
                label: m['cad.footer.guide_gridcraft'](),
                href: 'https://gridcraft.me',
              },
              {
                label: m['cad.footer.guide_deckcraft'](),
                href: 'https://deckcraft.me',
              },
              {
                label: m['cad.footer.guide_pdfcraft'](),
                href: 'https://pdfcrafttool.org',
              },
              {
                label: m['cad.footer.guide_photocraft'](),
                href: 'https://photocraftartcraft.com',
              },
            ],
          },
        ]
      : []),
    {
      title: m['cad.footer.legal'](),
      links: [
        { label: m['cad.nav.about'](), href: '/about' },
        { label: m['landing.footer.privacy'](), href: '/privacy-policy' },
        { label: m['landing.footer.terms'](), href: '/terms-of-service' },
        {
          label: m['landing.footer.aup'](),
          href: '/acceptable-use-policy',
        },
        {
          label: m['cad.nav.contact'](),
          href: '/contact',
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
