import { DEFAULT_FOOTER_BADGES } from '@/features/footer-badges/defaults';
import type { FooterBadge } from '@/features/footer-badges/types';
import { parseStoredFooterBadges } from '@/features/footer-badges/validation';

import { cn } from '@/lib/utils';
import { usePublicConfig } from '@/hooks/use-public-config';

export function FooterBadgeList({ className }: { className?: string }) {
  const { data } = usePublicConfig();
  const badges =
    data?.footer_badges === undefined
      ? DEFAULT_FOOTER_BADGES
      : parseStoredFooterBadges(data.footer_badges);

  if (badges.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap items-center gap-4', className)}>
      {badges.map((badge, index) => (
        <li key={`${index}:${badge.href}:${badge.src}`}>
          <a
            href={badge.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-6 items-center transition-opacity hover:opacity-80"
          >
            <img
              src={badge.src}
              alt={badge.alt}
              width={badge.width ?? 250}
              height={badge.height}
              loading="lazy"
              draggable={false}
              className="h-full w-auto max-w-[130px] object-contain"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
