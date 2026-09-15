import type { AppProps } from "../app/app-types";
import { UI_LABELS } from "../data/i18n";
import type { ThreatReport, UiLabels } from "../types/content";
import { formatDisplayDate } from "../utils/date";
import { Icon } from "../components/Icon";
import { Pagination } from "../components/Pagination";
import { rememberThreatLanguage, THREAT_LANGUAGES, threatFeedRoute, threatListRoute } from "../utils/threats";
import styles from "./ThreatsPage.module.css";

type ThreatsPageProps = AppProps & {
  page: number;
};

export function ThreatsPage({ content, route, page }: ThreatsPageProps) {
  const labels = UI_LABELS[route.language];
  const reports = content.threatReports;
  const latest = reports[0];
  const totalPages = content.currentThreatList?.totalPages ?? Math.max(1, Math.ceil(content.stats.threatReports / 30));
  const availableLanguages = content.currentThreatLanguages ?? THREAT_LANGUAGES;

  return (
    <section>
      <header className="content-card px-5 py-8 md:px-8 md:py-10 lg:px-10">
        <div className={styles.kicker}>
          <Icon name="shield-alert" />
          <span>{labels.threatIntelligence}</span>
        </div>
        <h1 className="mt-3 text-[1.8em] font-normal text-blog-heading">{labels.threatIntelligence}</h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-7 text-blog-muted">{labels.threatDescription}</p>
        <div className={styles.listToolbar}>
          <nav className={styles.languageSwitcher} aria-label={labels.threatIntelligence}>
            {availableLanguages.map((language) =>
              language === route.language ? (
                <span key={language} aria-current="page">
                  {labels.threatLanguageNames[language]}
                </span>
              ) : (
                <a key={language} href={threatListRoute(language, page)} data-background-post-link="" onClick={() => rememberThreatLanguage(language)}>
                  {labels.threatLanguageNames[language]}
                </a>
              )
            )}
          </nav>
          <a className={styles.feedLink} href={threatFeedRoute(route.language)}>
            <Icon name="rss" />
            <span>{labels.rss}</span>
          </a>
        </div>
        {latest ? (
          <section className={styles.latest} aria-labelledby="latest-threat-report">
            <div className={styles.latestHeader}>
              <span className={styles.latestLabel}>{labels.latest}</span>
              <time dateTime={latest.date}>{formatDisplayDate(latest.date)}</time>
            </div>
            <h2 id="latest-threat-report" className={styles.latestTitle}>
              <a href={latest.route}>{latest.title}</a>
            </h2>
            <p className={styles.latestSummary}>{latest.summary}</p>
            <ReportMetrics report={latest} labels={labels} />
          </section>
        ) : null}
      </header>

      {reports.length > 0 ? (
        <section className={styles.timeline} aria-label={labels.threatIntelligence}>
          {reports.map((report) => (
            <ThreatReportCard key={report.id} report={report} labels={labels} />
          ))}
        </section>
      ) : (
        <section className="content-card mt-4 px-5 py-12 text-center md:px-8">
          <p className="text-[14px] text-blog-muted">{labels.noThreatReports}</p>
        </section>
      )}

      <Pagination currentPage={page} totalPages={totalPages} labels={labels} basePath={threatListRoute(route.language)} />
    </section>
  );
}

function ThreatReportCard({ report, labels }: { report: ThreatReport; labels: UiLabels }) {
  return (
    <article className={`content-card ${styles.card}`} data-scroll-route={report.route}>
      <div className={styles.cardDate}>
        <time dateTime={report.date}>{formatDisplayDate(report.date)}</time>
      </div>
      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle} data-post-transition={report.route}>
          <a href={report.route}>{report.title}</a>
        </h2>
        <p className={styles.cardSummary}>{report.summary}</p>
        <ReportMetrics report={report} labels={labels} />
      </div>
    </article>
  );
}

function ReportMetrics({ report, labels }: { report: ThreatReport; labels: UiLabels }) {
  const metrics = [
    ["critical", labels.critical, report.critical],
    ["high", labels.high, report.high],
    ["medium", labels.medium, report.medium],
    ["low", labels.low, report.low],
    ["exploited", labels.exploited, report.exploited]
  ] as const;

  return (
    <div className={styles.metrics} aria-label={`${report.total} ${labels.threats}`}>
      {metrics.map(([kind, label, value]) => (
        <span key={kind} className={`${styles.metric} ${styles[kind]}`}>
          <span className={styles.metricLabel}>{label}</span>
          <strong>{value}</strong>
        </span>
      ))}
      <span className={styles.totalMetric}>
        <strong>{report.total}</strong> {labels.threats}
      </span>
    </div>
  );
}
