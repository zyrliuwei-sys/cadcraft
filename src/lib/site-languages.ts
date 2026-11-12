export const siteLanguages = [
  { locale: 'en', prefix: '', label: 'English' },
  { locale: 'it-IT', prefix: '/it', label: 'Italiano' },
  { locale: 'pt-BR', prefix: '/pt', label: 'Português' },
  { locale: 'de-DE', prefix: '/de', label: 'Deutsch' },
] as const;
export type SiteLanguage = (typeof siteLanguages)[number]['locale'];
export const translatedPagePaths = ['/', '/download', '/dwg-viewer'] as const;

/** Only shipped page groups may advertise or link to another language. */
export function pageLanguageVariants(path: string) {
  const base =
    path
      .split(/[?#]/)[0]
      .replace(/^\/(?:pt|it|de)(?=\/|$)/, '')
      .replace(/\/+$/, '') || '/';
  if (!(translatedPagePaths as readonly string[]).includes(base)) return [];
  return siteLanguages.map((language) => ({
    ...language,
    path: language.prefix + (base === '/' ? '/' : base),
  }));
}

export function pageLanguagePath(path: string, locale: string) {
  return (
    pageLanguageVariants(path).find((v) => v.locale === locale)?.path ?? path
  );
}
