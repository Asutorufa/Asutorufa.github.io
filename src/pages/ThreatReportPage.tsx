import type { AppProps } from "../app/app-types";
import { UI_LABELS } from "../data/i18n";
import { formatDisplayDate } from "../utils/date";
import { GitalkComments } from "../components/GitalkComments";
import { Icon } from "../components/Icon";
import { ThreatArticleMarkdown } from "../components/ThreatArticleMarkdown";
import { rememberThreatLanguage, sortThreatReportsByDateDesc, threatTranslationsForReport } from "../utils/threats";
import styles from "./ThreatsPage.module.css";

type ThreatReportPageProps = AppProps & {
  id: string;
};

export function ThreatReportPage({ content, route, id }: ThreatReportPageProps) {
  const report = content.threatReports.find((item) => item.id === id && item.language === route.language);
  const labels = UI_LABELS[route.language];

  if (!report) {
    return <p>{labels.notFound}</p>;
  }

  const languageReports = sortThreatReportsByDateDesc(content.threatReports.filter((item) => item.language === report.language));
  const reportIndex = languageReports.indexOf(report);
  const previousReport = languageReports[reportIndex + 1];
  const nextReport = languageReports[reportIndex - 1];
  const translations = threatTranslationsForReport(content.threatReports, report.id);

  return (
    <>
      <article className="content-card px-4 py-8 [contain:paint] md:px-8 md:py-14 lg:px-10">
        <header className="mb-10 text-center md:mb-14" data-post-transition={report.route}>
          <div className={styles.reportKicker}>
            <Icon name="shield-alert" />
            <span>{labels.threatIntelligence}</span>
          </div>
          <h1 className="mt-3 text-[1.7em] font-normal leading-normal text-blog-heading">{report.title}</h1>
          <div className={styles.reportMeta}>
            <time dateTime={report.date}>{formatDisplayDate(report.date)}</time>
            {report.updated && report.updated !== report.date ? (
              <time dateTime={report.updated}>
                {labels.modified} {formatDisplayDate(report.updated)}
              </time>
            ) : null}
          </div>
          <nav className={styles.languageSwitcher} aria-label={labels.threatIntelligence}>
            {translations.map((translation) =>
              translation.language === report.language ? (
                <span key={translation.language} aria-current="page">
                  {labels.threatLanguageNames[translation.language]}
                </span>
              ) : (
                <a
                  key={translation.language}
                  href={translation.route}
                  data-background-post-link=""
                  onClick={() => rememberThreatLanguage(translation.language)}
                >
                  {labels.threatLanguageNames[translation.language]}
                </a>
              )
            )}
          </nav>
        </header>

        <section className={styles.reportSummary} aria-label={labels.threatIntelligence}>
          <p>{report.summary}</p>
          <div className={styles.detailMetrics}>
            <Metric label={labels.critical} value={report.critical} kind="critical" />
            <Metric label={labels.high} value={report.high} kind="high" />
            <Metric label={labels.medium} value={report.medium} kind="medium" />
            <Metric label={labels.low} value={report.low} kind="low" />
            <Metric label={labels.exploited} value={report.exploited} kind="exploited" />
            <Metric label={labels.threats} value={report.total} kind="total" />
          </div>
          {report.cves.length > 0 || report.iocs.length > 0 ? (
            <div className={styles.secondaryFacts} aria-label={labels.threatIntelligence}>
              {report.cves.length > 0 ? <span>{report.cves.length} CVEs</span> : null}
              {report.iocs.length > 0 ? <span>{report.iocs.length} IOCs</span> : null}
            </div>
          ) : null}
          {report.cves.length > 0 ? (
            <div className={styles.cveChips} aria-label="CVE">
              {report.cves.slice(0, 5).map((cve) => (
                <span key={cve}>{cve}</span>
              ))}
            </div>
          ) : null}
        </section>

        <div className="mt-10" data-post-body-transition={report.route}>
          <ThreatArticleMarkdown html={report.bodyHtml} />
        </div>

        {report.generator || report.model ? (
          <footer className={styles.generationFooter}>
            <span>{labels.generatedBy}</span>
            {report.generator ? <strong>{report.generator}</strong> : null}
            {report.generator && report.model ? <span aria-hidden="true">·</span> : null}
            {report.model ? <strong>{report.model}</strong> : null}
            <time dateTime={report.date}>{formatDisplayDate(report.date)}</time>
          </footer>
        ) : null}

        <nav className={styles.reportNavigation} aria-label={labels.threatIntelligence}>
          {previousReport ? (
            <a href={previousReport.route} data-background-post-link="">
              <Icon name="chevron-left" />
              <span>
                <small>{labels.previousReport}</small>
                <strong>{previousReport.date}</strong>
              </span>
            </a>
          ) : (
            <span />
          )}
          {nextReport ? (
            <a href={nextReport.route} data-background-post-link="">
              <span>
                <small>{labels.nextReport}</small>
                <strong>{nextReport.date}</strong>
              </span>
              <Icon name="chevron-right" />
            </a>
          ) : (
            <span />
          )}
        </nav>
      </article>
      <section id="comments" className="content-card mt-4 overflow-hidden px-4 py-5 md:mt-6 md:px-8 md:py-7 lg:px-10">
        <GitalkComments id={`threat-${report.id}`} language={report.language} />
      </section>
    </>
  );
}

function Metric({ label, value, kind }: { label: string; value: number; kind: "critical" | "high" | "medium" | "low" | "exploited" | "total" }) {
  return (
    <span className={`${styles.detailMetric} ${styles[kind]}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </span>
  );
}
