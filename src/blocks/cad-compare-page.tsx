import {
  Bot,
  Check,
  Feather,
  Globe,
  Keyboard,
  Unlock,
  Workflow,
} from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { ctaPrimary, ctaSecondary } from '@/lib/cta';
import { m } from '@/paraglide/messages.js';
import { PageHero } from '@/blocks/cad-doc';
import { CadCta, CompareTable, SectionHeading } from '@/blocks/cad-sections';
import { Reveal } from '@/components/reveal';

export function CadComparePage() {
  const rows = [
    {
      label: m['cad.cmp.row_price'](),
      cc: m['cad.cmp.row_price_cc'](),
      ac: m['cad.cmp.row_price_ac'](),
      ccWins: true,
    },
    {
      label: m['cad.cmp.row_license'](),
      cc: m['cad.cmp.row_license_cc'](),
      ac: m['cad.cmp.row_license_ac'](),
      ccWins: true,
    },
    {
      label: m['cad.cmp.row_account'](),
      cc: m['cad.cmp.row_account_cc'](),
      ac: m['cad.cmp.row_account_ac'](),
      ccWins: true,
    },
    {
      label: m['cad.cmp.row_platforms'](),
      cc: m['cad.cmp.row_platforms_cc'](),
      ac: m['cad.cmp.row_platforms_ac'](),
      ccWins: true,
    },
    {
      label: m['cad.cmp.row_web'](),
      cc: m['cad.cmp.row_web_cc'](),
      ac: m['cad.cmp.row_web_ac'](),
      ccWins: true,
    },
    {
      label: m['cad.cmp.row_agents'](),
      cc: m['cad.cmp.row_agents_cc'](),
      ac: m['cad.cmp.row_agents_ac'](),
      ccWins: true,
    },
    {
      label: m['cad.cmp.row_tech'](),
      cc: m['cad.cmp.row_tech_cc'](),
      ac: m['cad.cmp.row_tech_ac'](),
    },
    {
      label: m['cad.cmp.row_dwg'](),
      cc: m['cad.cmp.row_dwg_cc'](),
      ac: m['cad.cmp.row_dwg_ac'](),
    },
    {
      label: m['cad.cmp.row_dxf'](),
      cc: m['cad.cmp.row_dxf_cc'](),
      ac: m['cad.cmp.row_dxf_ac'](),
    },
    {
      label: m['cad.cmp.row_2d'](),
      cc: m['cad.cmp.row_2d_cc'](),
      ac: m['cad.cmp.row_2d_ac'](),
    },
    {
      label: m['cad.cmp.row_3d'](),
      cc: m['cad.cmp.row_3d_cc'](),
      ac: m['cad.cmp.row_3d_ac'](),
    },
    {
      label: m['cad.cmp.row_support'](),
      cc: m['cad.cmp.row_support_cc'](),
      ac: m['cad.cmp.row_support_ac'](),
    },
    {
      label: m['cad.cmp.row_maturity'](),
      cc: m['cad.cmp.row_maturity_cc'](),
      ac: m['cad.cmp.row_maturity_ac'](),
    },
  ];

  const advantages = [
    [Unlock, m['cad.cmp.adv1_title'](), m['cad.cmp.adv1_desc']()],
    [Bot, m['cad.cmp.adv2_title'](), m['cad.cmp.adv2_desc']()],
    [Globe, m['cad.cmp.adv3_title'](), m['cad.cmp.adv3_desc']()],
    [Keyboard, m['cad.cmp.adv4_title'](), m['cad.cmp.adv4_desc']()],
    [Feather, m['cad.cmp.adv5_title'](), m['cad.cmp.adv5_desc']()],
    [Workflow, m['cad.cmp.adv6_title'](), m['cad.cmp.adv6_desc']()],
  ] as const;

  const chooseCc = [
    m['cad.cmp.choose_cc1'](),
    m['cad.cmp.choose_cc2'](),
    m['cad.cmp.choose_cc3'](),
    m['cad.cmp.choose_cc4'](),
  ];
  const chooseAc = [
    m['cad.cmp.choose_ac1'](),
    m['cad.cmp.choose_ac2'](),
    m['cad.cmp.choose_ac3'](),
    m['cad.cmp.choose_ac4'](),
  ];

  return (
    <>
      <PageHero
        eyebrow={m['cad.compare.eyebrow']()}
        title={m['cad.cmp.h1']()}
        lead={m['cad.cmp.lead']()}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/online" className={ctaPrimary}>
            {m['home.hero.cta_online']()}
          </Link>
          <Link href="/download" className={ctaSecondary}>
            {m['home.hero.cta_download']()}
          </Link>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          {m['cad.cmp.table_title']()}
        </h2>
        <CompareTable rows={rows} className="mt-8" />
      </section>

      <section className="bg-muted border-y py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading title={m['cad.cmp.adv_title']()} />
            <div className="mt-12 grid gap-x-16 gap-y-10 md:grid-cols-2">
              {advantages.map(([Icon, title, desc]) => (
                <div
                  key={title}
                  className="border-foreground/80 flex gap-5 border-t pt-6"
                >
                  <Icon className="text-signal-ink mt-1 size-6 shrink-0" />
                  <div>
                    <h3 className="font-display text-xl font-semibold">
                      {title}
                    </h3>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <Reveal>
          <SectionHeading title={m['cad.cmp.choose_title']()} />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              [m['cad.cmp.choose_cc_title'](), chooseCc, true],
              [m['cad.cmp.choose_ac_title'](), chooseAc, false],
            ].map(([title, items, highlight]) => (
              <div
                key={title as string}
                className={
                  highlight
                    ? 'border-foreground border-2 p-8'
                    : 'rounded-sm border p-8'
                }
              >
                <h3 className="font-display text-xl font-semibold">
                  {title as string}
                </h3>
                <ul className="mt-5 space-y-3">
                  {(items as string[]).map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check className="text-signal-ink mt-1 size-4 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-8 text-xs leading-5">
            {m['cad.cmp.disclaimer']()}
          </p>
        </Reveal>
      </section>

      <CadCta />
    </>
  );
}
