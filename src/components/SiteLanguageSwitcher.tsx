import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { MotionPresets } from "../animation/motion-presets";
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
  const indicatorId = useId();
  const prefersReducedMotion = useReducedMotion();
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
    <div className={styles.root} role="group" aria-label={labels.language}>
      {options.map(({ language, href }) => {
        const active = routeHasLanguageLinks ? language === route.language : language === selectedLanguage;
        const name = labels.threatLanguageNames[language];
        const className = clsx(styles.button, active && styles.active);
        const content = (
          <>
            {active ? <motion.span className={styles.indicator} layoutId={`site-language-indicator-${indicatorId}`} transition={MotionPresets.spring} /> : null}
            <span className={styles.label}>{name}</span>
          </>
        );

        if (href) {
          return active ? (
            <span key={language} className={className} aria-current="page">
              {content}
            </span>
          ) : (
            <motion.a
              key={language}
              className={className}
              href={href}
              data-background-post-link=""
              onClick={() => selectLanguage(language)}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
              transition={MotionPresets.fast}
            >
              {content}
            </motion.a>
          );
        }

        return (
          <motion.button
            key={language}
            type="button"
            className={className}
            aria-pressed={active}
            onClick={() => selectLanguage(language)}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            transition={MotionPresets.fast}
          >
            {content}
          </motion.button>
        );
      })}
    </div>
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
