import { getRouteApi } from '@tanstack/react-router';
import { DEFAULT_FOOTER_BADGES } from '@/features/footer-badges/defaults';
import type { FooterBadge } from '@/features/footer-badges/types';
import { parseStoredFooterBadges } from '@/features/footer-badges/validation';

import { cn } from '@/lib/utils';
import { usePublicConfig } from '@/hooks/use-public-config';
import { FooterBadgeLink } from '@/components/footer-badge-link';

function BadgeTrack({
  badges,
  hidden,
}: {
  badges: FooterBadge[];
  hidden?: boolean;
}) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-8 pr-8"
    >
      {badges.map((badge, index) => (
        <li key={`${index}:${badge.href}:${badge.src}`} className="shrink-0">
          <FooterBadgeLink
            badge={badge}
            hidden={hidden}
            className="flex h-6 items-center transition-opacity hover:opacity-80"
            imageClassName="h-full w-auto max-w-[130px] object-contain"
          />
        </li>
      ))}
    </ul>
  );
}

const rootRoute = getRouteApi('__root__');

export function FooterBadgeList({ className }: { className?: string }) {
  const { data } = usePublicConfig();
  // Include badges in the initial HTML for directory verifiers without JavaScript.
  const ssrStored = rootRoute.useLoaderData({
    select: (data) => data.footerBadges,
  });
  const stored = data ? data.footer_badges : (ssrStored ?? undefined);
  const badges =
    stored === undefined
      ? DEFAULT_FOOTER_BADGES
      : parseStoredFooterBadges(stored);

  if (badges.length === 0) return null;

  // Two identical tracks scroll left by 50% so the loop is seamless;
  // hovering pauses it (see .marquee in globals.css).
  return (
    <div
      className={cn(
        'marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        className
      )}
    >
      <div
        className="marquee-track flex w-max"
        style={{ animationDuration: `${Math.max(badges.length * 4, 20)}s` }}
      >
        <BadgeTrack badges={badges} />
        <BadgeTrack badges={badges} hidden />
      </div>
    </div>
  );
}
