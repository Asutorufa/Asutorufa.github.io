import fs from "node:fs/promises";
import path from "node:path";
import { UI_LABELS } from "../../src/data/i18n";
import type { ContentManifest, SiteLanguage } from "../../src/types/content";
import { threatFeedRoute, threatListRoute, THREAT_LANGUAGES } from "../../src/utils/threats";
import { escapeHtml } from "./html";
import { formatDate, parseLooseDate } from "./content-utils";
import { distDir } from "./paths";

export async function generateThreatFeeds(content: ContentManifest) {
  await Promise.all(
    THREAT_LANGUAGES.map(async (language) => {
      const outputPath = path.join(distDir, threatFeedRoute(language).replace(/^\//, ""));
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, threatFeedXml(content, language));
    })
  );
}

export function threatFeedXml(content: ContentManifest, language: SiteLanguage) {
  const labels = UI_LABELS[language];
  const reports = content.threatReports.filter((report) => report.language === language).slice(0, 100);
  const listUrl = new URL(threatListRoute(language), content.config.url).toString();
  const feedUrl = new URL(threatFeedRoute(language), content.config.url).toString();
  const updated = reports[0]?.updated || reports[0]?.date || new Date().toISOString();
  const items = reports.map((report) => {
    const reportUrl = new URL(report.route, content.config.url).toString();
    return `    <item>
      <title>${escapeHtml(report.title)}</title>
      <link>${escapeHtml(reportUrl)}</link>
      <guid isPermaLink="true">${escapeHtml(reportUrl)}</guid>
      <pubDate>${toRssDate(report.updated || report.date)}</pubDate>
      <description>${escapeHtml(report.summary || report.plainText.slice(0, 240))}</description>
    </item>`;
  });

  return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(labels.threatIntelligence)}</title>
    <link>${escapeHtml(listUrl)}</link>
    <atom:link href="${escapeHtml(feedUrl)}" rel="self" type="application/rss+xml" />
    <description>${escapeHtml(labels.threatDescription)}</description>
    <language>${rssLanguage(language)}</language>
    <lastBuildDate>${toRssDate(updated)}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>
`;
}

function toRssDate(value: string) {
  const date = parseLooseDate(value);
  if (date) return date.toUTCString();

  const fallback = new Date(`${formatDate(value)}T00:00:00Z`);
  return Number.isNaN(fallback.getTime()) ? new Date(0).toUTCString() : fallback.toUTCString();
}

function rssLanguage(language: SiteLanguage) {
  return language === "zh-Hans" ? "zh-CN" : language;
}
