import { useEffect, useRef, useState } from 'react';
import { Download, Globe } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cadcraftLinks } from '@/config/cadcraft';
import { ctaPrimary, ctaSecondary } from '@/lib/cta';
import {
  desktopDownloadPlatform,
  HOME_CTA_EXPERIMENT,
  homeCtaVariant,
  type DesktopPlatform,
  type HomeCtaVariant,
} from '@/lib/home-cta-experiment';
import { track } from '@/lib/track';
import { m } from '@/paraglide/messages.js';

export function HomeHeroActions() {
  const ref = useRef<HTMLDivElement>(null);
  const exposed = useRef(false);
  const [assignment, setAssignment] = useState<{
    variant: HomeCtaVariant;
    platform: DesktopPlatform;
  } | null>(null);
  useEffect(() => {
    const platform = desktopDownloadPlatform(
      navigator.userAgent,
      navigator.platform,
      navigator.maxTouchPoints
    );
    if (
      !platform ||
      !window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches ||
      !ref.current
    )
      return;
    const observer = new IntersectionObserver((entries) => {
      if (exposed.current || !entries.some((e) => e.isIntersecting)) return;
      const variant = homeCtaVariant(true);
      if (!variant) return;
      exposed.current = true;
      setAssignment({ variant, platform });
      track('home_cta_exposure', { experiment: HOME_CTA_EXPERIMENT, platform });
      observer.disconnect();
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const direct = assignment?.variant === 'download_first';
  return (
    <div ref={ref} className="flex flex-col gap-2">
      <div className="flex flex-col gap-3 sm:flex-row">
        {direct ? (
          <a
            href={cadcraftLinks[assignment.platform]}
            className={ctaPrimary}
            onClick={() =>
              track('home_cta_click', {
                target: 'download',
                platform: assignment.platform,
              })
            }
          >
            <Download className="size-4" />
            {assignment.platform === 'windows'
              ? m['home.hero.cta_windows']()
              : m['home.hero.cta_macos']()}
          </a>
        ) : (
          <Link
            href="/online"
            className={ctaPrimary}
            onClick={() => track('home_cta_click', { target: 'online' })}
          >
            <Globe className="size-4" />
            {m['home.hero.cta_online']()}
          </Link>
        )}
        <Link
          href={direct ? '/online' : '/download'}
          className={ctaSecondary}
          onClick={() =>
            track('home_cta_click', {
              target: direct ? 'online' : 'download_page',
            })
          }
        >
          {direct ? (
            <Globe className="size-4" />
          ) : (
            <Download className="size-4" />
          )}
          {direct ? m['home.hero.cta_online']() : m['home.hero.cta_download']()}
        </Link>
      </div>
      {direct && (
        <Link
          href="/download"
          className="text-muted-foreground self-start text-xs underline underline-offset-4"
        >
          {m['home.hero.all_downloads']()}
        </Link>
      )}
    </div>
  );
}
