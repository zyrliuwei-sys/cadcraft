import { m } from '@/paraglide/messages.js';
import { NativeAd, ResponsiveBannerAd } from '@/components/analytics/banner-ad';

export function HomeBannerAd() {
  return (
    <ResponsiveBannerAd
      placement="home-hero"
      label={m['common.advertisement']()}
      className="mt-8"
    />
  );
}

export function HomeNativeAd() {
  return (
    <NativeAd
      placement="home-intro"
      label={m['common.advertisement']()}
      className="mx-auto mb-12 max-w-7xl px-4 sm:px-6 lg:mb-16"
    />
  );
}
