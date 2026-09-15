import type { ContentManifest, RouteEntry, SiteLanguage, ThreatReport } from "../types/content";
import {
  browserSiteLanguage,
  preferredSiteLanguage,
  readSiteLanguagePreference,
  rememberSiteLanguage,
  SITE_LANGUAGE_CHANGE_EVENT,
  SITE_LANGUAGES,
  siteLanguageFromBrowserLanguages
} from "./language";

export const THREAT_DEFAULT_LANGUAGE: SiteLanguage = "ja";
export const THREAT_LANGUAGES = SITE_LANGUAGES;
export const THREAT_REPORTS_PER_PAGE = 30;
export const THREAT_LANGUAGE_CHANGE_EVENT = SITE_LANGUAGE_CHANGE_EVENT;

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
  return readSiteLanguagePreference();
}

export function preferredThreatLanguage(): SiteLanguage {
  return preferredSiteLanguage();
}

export function browserThreatLanguage(): SiteLanguage {
  return browserSiteLanguage();
}

export function threatLanguageFromBrowserLanguages(languages: readonly string[]): SiteLanguage {
  return siteLanguageFromBrowserLanguages(languages);
}

export function rememberThreatLanguage(language: SiteLanguage) {
  rememberSiteLanguage(language);
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
