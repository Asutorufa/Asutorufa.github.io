import type { SiteLanguage } from "../types/content";

export const SITE_LANGUAGES: SiteLanguage[] = ["ja", "en", "zh-Hans"];
export const SITE_LANGUAGE_CHANGE_EVENT = "asutorufa-language-change";
const SITE_LANGUAGE_STORAGE_KEY = "asutorufa:language";
const LEGACY_THREAT_LANGUAGE_STORAGE_KEY = "asutorufa:threat-language";

export function readSiteLanguagePreference(): SiteLanguage | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const value = window.localStorage.getItem(SITE_LANGUAGE_STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_THREAT_LANGUAGE_STORAGE_KEY);
    return value && SITE_LANGUAGES.includes(value as SiteLanguage) ? (value as SiteLanguage) : undefined;
  } catch {
    return undefined;
  }
}

export function preferredSiteLanguage(): SiteLanguage {
  return readSiteLanguagePreference() ?? browserSiteLanguage();
}

export function browserSiteLanguage(): SiteLanguage {
  if (typeof navigator === "undefined") return "en";
  return siteLanguageFromBrowserLanguages(navigator.languages?.length ? navigator.languages : [navigator.language]);
}

export function siteLanguageFromBrowserLanguages(languages: readonly string[]): SiteLanguage {
  for (const language of languages) {
    const normalized = language.trim().toLowerCase();
    if (normalized === "ja" || normalized.startsWith("ja-")) return "ja";
    if (normalized === "en" || normalized.startsWith("en-")) return "en";
    if (normalized === "zh" || normalized.startsWith("zh-") || normalized.startsWith("zh_")) return "zh-Hans";
  }
  return "en";
}

export function rememberSiteLanguage(language: SiteLanguage) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SITE_LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage restrictions and keep navigation functional.
  }
  window.dispatchEvent(new Event(SITE_LANGUAGE_CHANGE_EVENT));
}
