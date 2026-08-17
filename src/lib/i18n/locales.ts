export const SUPPORTED_LOCALES = ["zh-TW", "zh-CN", "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "zh-TW";
export const LOCALE_STORAGE_KEY = "ai-interview-coach-locale";

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === "string" && SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function localeFromBrowserLanguage(language?: string): SupportedLocale {
  if (!language) return DEFAULT_LOCALE;
  const normalized = language.toLowerCase();
  if (normalized === "zh-tw" || normalized === "zh-hk" || normalized.startsWith("zh-hant")) return "zh-TW";
  if (normalized === "zh-cn" || normalized === "zh-sg" || normalized.startsWith("zh-hans")) return "zh-CN";
  return "en";
}

export function resolveInitialLocale(storedLocale: string | null, browserLanguage?: string): SupportedLocale {
  return isSupportedLocale(storedLocale) ? storedLocale : localeFromBrowserLanguage(browserLanguage);
}
