// Locale display names for the language switcher UI.
// Locales themselves are defined in project.inlang/settings.json and
// exposed at runtime via @/paraglide/runtime.js (locales, baseLocale).
import { siteLanguages } from '@/lib/site-languages';

export const localeNames: Record<string, string> = Object.fromEntries(
  siteLanguages.map(({ locale, label }) => [locale, label])
);
