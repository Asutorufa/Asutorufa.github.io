import type { ContentManifest, RouteEntry, SiteLanguage, ThreatReport } from "../types/content";

export const THREAT_DEFAULT_LANGUAGE: SiteLanguage = "ja";
export const THREAT_LANGUAGES: SiteLanguage[] = ["ja", "en", "zh-Hans"];
export const THREAT_REPORTS_PER_PAGE = 30;
export const THREAT_LANGUAGE_CHANGE_EVENT = "asutorufa-threat-language-change";
const THREAT_LANGUAGE_STORAGE_KEY = "asutorufa:threat-language";

export function threatListRoute(language: SiteLanguage, page = 1) {
  const prefix = language === THREAT_DEFAULT_LANGUAGE ? "/threats" : `/threats/${language}`;
  return `${prefix}${page === 1 ? "/" : `/page/${page}/`}`;
}

export function threatReportRoute(language: SiteLanguage, id: string) {
  return language === THREAT_DEFAULT_LANGUAGE ? `/threats/${id}/` : `/threats/${language}/${id}/`;
}

export function threatFeedRoute(language: SiteLanguage) {
  const prefix = language === THREAT_DEFAULT_LANGUAGE ? "/threats" : `/threats/${language}`;
  return `${prefix}/rss.xml`;
}

export function readThreatLanguagePreference(): SiteLanguage | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const value = window.localStorage.getItem(THREAT_LANGUAGE_STORAGE_KEY);
    return value && THREAT_LANGUAGES.includes(value as SiteLanguage) ? (value as SiteLanguage) : undefined;
  } catch {
    return undefined;
  }
}

export function preferredThreatLanguage(): SiteLanguage {
  return readThreatLanguagePreference() ?? browserThreatLanguage();
}

export function browserThreatLanguage(): SiteLanguage {
  if (typeof navigator === "undefined") return "en";
  return threatLanguageFromBrowserLanguages(navigator.languages?.length ? navigator.languages : [navigator.language]);
}

export function threatLanguageFromBrowserLanguages(languages: readonly string[]): SiteLanguage {
  for (const language of languages) {
    const normalized = language.trim().toLowerCase();
    if (normalized === "ja" || normalized.startsWith("ja-")) return "ja";
    if (normalized === "en" || normalized.startsWith("en-")) return "en";
    if (normalized === "zh" || normalized.startsWith("zh-") || normalized.startsWith("zh_")) return "zh-Hans";
  }
  return "en";
}

export function rememberThreatLanguage(language: SiteLanguage) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(THREAT_LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage restrictions and keep navigation functional.
  }
  window.dispatchEvent(new Event(THREAT_LANGUAGE_CHANGE_EVENT));
}

export function threatReportsForLanguage(reports: ThreatReport[], language: SiteLanguage) {
  return reports.filter((report) => report.language === language);
}

export function sortThreatReportsByDateDesc(reports: ThreatReport[]) {
  return [...reports].sort((left, right) => right.date.localeCompare(left.date) || left.id.localeCompare(right.id));
}

export function threatTranslationsForReport(reports: ThreatReport[], id: string) {
  return THREAT_LANGUAGES.map((language) => reports.find((report) => report.id === id && report.language === language)).filter(
    (report): report is ThreatReport => report !== undefined
  );
}

export function threatAlternateEntries(reports: ContentManifest["threatReports"], route: RouteEntry) {
  const entries: Array<{ hreflang: SiteLanguage | "x-default"; route: string }> = [];

  if (route.kind === "threat-report" && route.params?.id) {
    for (const language of THREAT_LANGUAGES) {
      const report = reports.find((item) => item.id === route.params?.id && item.language === language);
      if (report) entries.push({ hreflang: language, route: report.route });
    }
  } else if (route.kind === "threats" || route.kind === "threats-page") {
    const page = Number(route.params?.page ?? "1");
    for (const language of THREAT_LANGUAGES) {
      const languageReports = threatReportsForLanguage(reports, language);
      if (page <= Math.max(1, Math.ceil(languageReports.length / THREAT_REPORTS_PER_PAGE))) {
        entries.push({ hreflang: language, route: threatListRoute(language, page) });
      }
    }
  }

  const defaultRoute = entries.find((entry) => entry.hreflang === THREAT_DEFAULT_LANGUAGE)?.route;
  if (defaultRoute) entries.push({ hreflang: "x-default", route: defaultRoute });
  return entries;
}
