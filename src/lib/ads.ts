// Pages that must not load ad scripts: no publisher content, or behind
// sign-in. Shared by the AdSense loader in __root.tsx and <BannerAd />.
export const NO_ADS_PATH =
  /^\/(?:admin|settings|sign-in|sign-up|forgot-password|reset-password|verify-email|auth-callback|redeem-invite)(?:\/|$)/;
