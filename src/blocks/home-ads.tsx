import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { AdSenseUnit } from '@/components/analytics/adsense-unit';

export function HomeBannerAd() {
  return (
    <AdSenseUnit
      placement="home-hero"
      slot={envConfigs.adsense_home_hero_slot}
      format="banner"
      label={m['common.advertisement']()}
      className="mt-8"
    />
  );
}

export function HomeNativeAd() {
  return (
    <AdSenseUnit
      placement="home-intro"
      slot={envConfigs.adsense_home_intro_slot}
      format="rectangle"
      label={m['common.advertisement']()}
      className="mx-auto mb-12 max-w-7xl px-4 sm:px-6 lg:mb-16"
    />
  );
}
