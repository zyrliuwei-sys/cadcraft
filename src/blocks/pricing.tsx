'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CalendarClock,
  Film,
  Infinity as InfinityIcon,
  MonitorPlay,
  Sparkles,
  XCircle,
} from 'lucide-react';

import { duetCredits } from '@/config/hotel-lobby-pricing';
import { pricingCatalog } from '@/config/pricing';
import { apiGet } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { useCheckout } from '@/hooks/use-checkout';
import {
  PricingTable,
  type PricingFeature,
  type PricingGroup,
  type PricingPlan,
} from '@/components/pricing-table';

// $9.9 rather than $9.90; whole dollars stay $23.
function usd(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function Pricing({
  title,
  variant = 'section',
}: {
  title?: string;
  /** `dialog` drops the page-section chrome for use inside a modal. */
  variant?: 'section' | 'dialog';
} = {}) {
  const { checkout, modal } = useCheckout({ backTo: '/pricing' });

  // Live per-video price so "≈ N videos" matches what generation charges.
  const { data: priceData } = useQuery({
    queryKey: ['hotel-lobby-price'],
    queryFn: () =>
      apiGet<{ credits: number; lengths?: Record<string, number> }>(
        '/api/hotel-lobby/price'
      ),
    staleTime: 10 * 60_000,
  });
  const perVideo = priceData?.credits ?? duetCredits();
  const perLongVideo = priceData?.lengths?.['15'] ?? duetCredits(15);

  function features(credits: number, extra: PricingFeature[]) {
    return [
      {
        icon: Sparkles,
        label: m['landing.pricing.feature_credits']({
          credits: credits.toLocaleString('en-US'),
        }),
      },
      {
        icon: Film,
        label:
          credits >= perLongVideo
            ? m['landing.pricing.feature_videos_lengths']({
                short: Math.floor(credits / perVideo),
                long: Math.floor(credits / perLongVideo),
              })
            : m['landing.pricing.feature_videos_short_only']({
                short: Math.floor(credits / perVideo),
                credits: perLongVideo.toLocaleString('en-US'),
              }),
      },
      { icon: MonitorPlay, label: m['landing.pricing.feature_hd']() },
      ...extra,
    ];
  }

  // Display data comes from the same catalog the checkout API trusts.
  function plan(
    productId: string,
    opts: {
      name: string;
      description: string;
      featured?: boolean;
      badge?: string;
      highlight?: string;
      plainFrame?: boolean;
      extra?: PricingFeature[];
      originalPrice?: string;
    }
  ): PricingPlan {
    const product = pricingCatalog[productId];
    const interval = product.plan?.interval;
    // Yearly plans are shown as their monthly equivalent, billed yearly.
    const yearly = interval === 'year';
    const card: PricingPlan = {
      id: productId,
      name: opts.name,
      description: yearly
        ? `${opts.description} · ${m['landing.pricing.billed_yearly']({ price: usd(product.priceInCents) })}`
        : opts.description,
      price: usd(
        yearly ? Math.round(product.priceInCents / 12) : product.priceInCents
      ),
      originalPrice: opts.originalPrice,
      interval: interval ? m['landing.pricing.per_month']() : undefined,
      featured: opts.featured,
      badge: opts.badge,
      plainFrame: opts.plainFrame,
      highlight: opts.highlight,
      features: features(product.credits, opts.extra ?? []),
      productId,
      priceInCents: product.priceInCents,
      currency: product.currency,
      credits: product.credits,
      plan: product.plan,
      buttonText: product.plan ? undefined : m['landing.pricing.buy_now'](),
    };
    return card;
  }

  const packExtra = [
    {
      icon: InfinityIcon,
      label: m['landing.pricing.feature_no_subscription'](),
    },
  ];
  const monthlyExtra = [
    {
      icon: CalendarClock,
      label: m['landing.pricing.feature_monthly_refill'](),
    },
    { icon: XCircle, label: m['landing.pricing.feature_cancel']() },
  ];
  const tiers = [
    ['basic', m['landing.pricing.basic'](), m['landing.pricing.basic_desc']()],
    ['pro', m['landing.pricing.pro'](), m['landing.pricing.pro_desc']()],
    [
      'studio',
      m['landing.pricing.studio'](),
      m['landing.pricing.studio_desc'](),
    ],
  ] as const;

  const groups: PricingGroup[] = [
    // One-time is the tab shown by default (see defaultGroup below).
    {
      key: 'monthly',
      label: m['landing.pricing.monthly'](),
      plans: tiers.map(([tier, name, description]) =>
        plan(`${tier}_monthly`, {
          name,
          description,
          featured: tier === 'pro',
          badge: tier === 'pro' ? m['landing.pricing.popular']() : undefined,
          extra: monthlyExtra,
        })
      ),
    },
    {
      key: 'one-time',
      label: m['landing.pricing.one_time'](),
      plans: [
        plan('pack_single', {
          name: m['landing.pricing.pack_single'](),
          description: m['landing.pricing.pack_single_desc'](),
          extra: packExtra,
        }),
        plan('pack_starter', {
          name: m['landing.pricing.pack_starter'](),
          description: m['landing.pricing.pack_desc'](),
          featured: true,
          badge: m['landing.pricing.popular'](),
          extra: packExtra,
        }),
        plan('pack_standard', {
          name: m['landing.pricing.pack_standard'](),
          description: m['landing.pricing.pack_desc'](),
          extra: packExtra,
        }),
        plan('pack_pro', {
          name: m['landing.pricing.pack_pro'](),
          description: m['landing.pricing.pack_desc'](),
          extra: packExtra,
        }),
      ],
    },
  ];

  const dialog = variant === 'dialog';
  const Wrapper = dialog ? 'div' : 'section';

  return (
    <Wrapper
      id={dialog ? undefined : 'pricing'}
      className={
        dialog ? undefined : 'border-border border-t px-4 py-24 sm:py-32'
      }
    >
      <div className="mx-auto max-w-5xl">
        <div className={dialog ? 'mb-8 pr-8 text-center' : 'mb-20 text-center'}>
          <h2
            className={
              dialog
                ? 'font-serif text-2xl font-normal tracking-tight sm:text-3xl'
                : 'font-serif text-4xl font-normal tracking-tight sm:text-5xl'
            }
          >
            {title ?? m['landing.pricing.title']()}
          </h2>
          <p className="text-muted-foreground mt-5">
            {m['landing.pricing.description']()}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            {m['landing.pricing.per_video_lengths']({
              short: perVideo.toLocaleString('en-US'),
              long: perLongVideo.toLocaleString('en-US'),
            })}
          </p>
        </div>
        <PricingTable
          groups={groups}
          defaultGroup="one-time"
          onCheckout={checkout}
        />
      </div>

      {modal}
    </Wrapper>
  );
}
