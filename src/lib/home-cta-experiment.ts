export const HOME_CTA_EXPERIMENT = 'home_cta_v1';
export const HOME_CTA_EXPERIMENT_ENABLED = true;
export type HomeCtaVariant = 'control' | 'download_first';
export type DesktopPlatform = 'windows' | 'macos';
const STORAGE_KEY = 'cc_home_cta_v1';
let memoryVariant: HomeCtaVariant | null = null;

export function desktopDownloadPlatform(
  userAgent: string,
  platform: string,
  maxTouchPoints = 0
): DesktopPlatform | null {
  if (
    /android|iphone|ipad|ipod|mobile|cros/i.test(userAgent) ||
    maxTouchPoints > 1
  )
    return null;
  if (/win/i.test(platform) && !/arm|aarch64/i.test(userAgent))
    return 'windows';
  if (/mac/i.test(platform)) return 'macos';
  return null;
}

/** Read everywhere; assign only when an eligible visitor sees the home CTA. */
export function homeCtaVariant(assign = false): HomeCtaVariant | null {
  if (!HOME_CTA_EXPERIMENT_ENABLED || typeof window === 'undefined')
    return null;
  if (memoryVariant) return memoryVariant;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'control' || saved === 'download_first')
      return (memoryVariant = saved);
  } catch {}
  if (!assign) return null;
  memoryVariant =
    crypto.getRandomValues(new Uint32Array(1))[0] % 2
      ? 'download_first'
      : 'control';
  try {
    window.localStorage.setItem(STORAGE_KEY, memoryVariant);
  } catch {}
  return memoryVariant;
}

export function homeCtaVariantTag() {
  const variant = homeCtaVariant();
  return variant ? `${HOME_CTA_EXPERIMENT}:${variant}` : undefined;
}
