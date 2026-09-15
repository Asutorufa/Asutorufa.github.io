import { useEffect, useState } from "react";
import type { ContentManifest, RouteEntry, SiteLanguage, UiLabels } from "../types/content";
import { preferredSiteLanguage, rememberSiteLanguage, SITE_LANGUAGE_CHANGE_EVENT, SITE_LANGUAGES } from "../utils/language";
import { threatListRoute, threatReportRoute, THREAT_REPORTS_PER_PAGE } from "../utils/threats";
import styles from "./SiteLanguageSwitcher.module.css";

type SiteLanguageSwitcherProps = {
  content: ContentManifest;
  route: RouteEntry;
  labels: UiLabels;
};

type LanguageOption = {
  language: SiteLanguage;
  href?: string;
};

type LinkedLanguageOption = LanguageOption & {
  href: string;
};

export function SiteLanguageSwitcher({ content, route, labels }: SiteLanguageSwitcherProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<SiteLanguage>(route.language);
  const options = languageOptions(content, route);
  const routeHasLanguageLinks = route.kind === "threats" || route.kind === "threats-page" || route.kind === "threat-report";

  useEffect(() => {
    const updateLanguage = () => setSelectedLanguage(preferredSiteLanguage());
    updateLanguage();
    window.addEventListener(SITE_LANGUAGE_CHANGE_EVENT, updateLanguage);
    return () => window.removeEventListener(SITE_LANGUAGE_CHANGE_EVENT, updateLanguage);
  }, [route.route]);

  const selectLanguage = (language: SiteLanguage) => {
    setSelectedLanguage(language);
    rememberSiteLanguage(language);
  };

  return (
    <section className={styles.root} aria-label={labels.language}>
      <span className={styles.label}>{labels.language}</span>
      <div className={styles.options} role="group" aria-label={labels.language}>
        {options.map(({ language, href }) => {
          const active = routeHasLanguageLinks ? language === route.language : language === selectedLanguage;
          const name = labels.threatLanguageNames[language];

          return href ? (
            active ? (
              <span key={language} className={`${styles.option} ${styles.active}`} aria-current="page">
                {name}
              </span>
            ) : (
              <a key={language} className={styles.option} href={href} data-background-post-link="" onClick={() => selectLanguage(language)}>
                {name}
              </a>
            )
          ) : (
            <button
              key={language}
              type="button"
              className={`${styles.option} ${active ? styles.active : ""}`}
              aria-pressed={active}
              onClick={() => selectLanguage(language)}
            >
              {name}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function languageOptions(content: ContentManifest, route: RouteEntry): LanguageOption[] {
  if (route.kind === "threat-report" && route.params?.id) {
    const id = route.params.id;
    return SITE_LANGUAGES.map((language) => {
      const report = content.threatReports.find((item) => item.id === id && item.language === language);
      return report ? { language, href: threatReportRoute(language, id) } : undefined;
    }).filter((option): option is LinkedLanguageOption => option !== undefined);
  }

  if (route.kind === "threats" || route.kind === "threats-page") {
    const page = Number(route.params?.page ?? "1");
    return SITE_LANGUAGES.map((language) => {
      const reports = content.threatReports.filter((report) => report.language === language);
      const totalPages = Math.max(1, Math.ceil(reports.length / THREAT_REPORTS_PER_PAGE));
      return page <= totalPages ? { language, href: threatListRoute(language, page) } : undefined;
    }).filter((option): option is LinkedLanguageOption => option !== undefined);
  }

  return SITE_LANGUAGES.map((language) => ({ language }));
}
