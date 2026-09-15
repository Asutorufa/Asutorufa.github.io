import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import type { ContentManifest, RouteEntry, SiteLanguage, ThreatReport } from "../../src/types/content";
import { THREAT_LANGUAGES, threatFeedRoute, threatLanguageFromBrowserLanguages, threatReportRoute, threatTranslationsForReport } from "../../src/utils/threats";
import { buildRoutes } from "./build-routes";
import { contentIndex } from "./content-index";
import { assertThreatReportConsistency, collectThreatReports } from "./collect-content";
import { createThreatReport } from "./content-utils";
import { feedXml } from "./generate-feed";
import { searchRecords } from "./generate-search";
import { sitemapXml } from "./generate-sitemap";
import { renderHtmlShell } from "./html";
import { threatFeedXml } from "./generate-threat-feed";
import { parseFrontMatter } from "./front-matter";
import { renderMarkdown } from "./render-markdown";
import { routePayload } from "./render-html";

test("parses the zh-Hans, en, and ja representations of one report", async () => {
  const reports = await withTempDirectory(async (directory) => {
    await writeTranslations(directory, "2026-09-15");
    return collectThreatReports(directory);
  });

  assert.equal(reports.length, 3);
  assert.deepEqual(reports.map((report) => report.language).sort(), [...THREAT_LANGUAGES].sort());
  assert.deepEqual(new Set(reports.map((report) => report.id)), new Set(["2026-09-15"]));
  assert.deepEqual(
    new Set(reports.map((report) => report.route)),
    new Set(["/threats/zh-Hans/2026-09-15/", "/threats/en/2026-09-15/", "/threats/2026-09-15/"])
  );
  assert.deepEqual(reports.find((report) => report.language === "zh-Hans")?.tags, ["CVE-2026-12345", "ransomware", "supply-chain", "zero-day"]);
});

test("orders threat languages and resolves browser language fallback", () => {
  assert.deepEqual(THREAT_LANGUAGES, ["ja", "en", "zh-Hans"]);
  assert.equal(threatLanguageFromBrowserLanguages(["ja-JP", "en-US"]), "ja");
  assert.equal(threatLanguageFromBrowserLanguages(["en-US", "ja-JP"]), "en");
  assert.equal(threatLanguageFromBrowserLanguages(["zh-CN"]), "zh-Hans");
  assert.equal(threatLanguageFromBrowserLanguages(["fr-FR", "de-DE"]), "en");
});

test("requires the date directory, id, date, and language filename to agree", async () => {
  await assert.rejects(
    () => createThreatReport("source/_threats/2026-02-30/en.md", parseFrontMatter(reportMarkdown("2026-02-30", "en")), []),
    /Invalid threat report directory/
  );
  await assert.rejects(
    () => createThreatReport("source/_threats/2026-09-15/en.md", parseFrontMatter(reportMarkdown("2026-09-15", "en", 'id: "2026-09-14"')), []),
    /id mismatch/
  );
  await assert.rejects(
    () => createThreatReport("source/_threats/2026-09-15/en.md", parseFrontMatter(reportMarkdown("2026-09-14", "en", 'id: "2026-09-15"')), []),
    /date mismatch/
  );
  await assert.rejects(
    () => createThreatReport("source/_threats/2026-09-15/en.md", parseFrontMatter(reportMarkdown("2026-09-15", "ja")), []),
    /language mismatch/
  );
});

test("rejects duplicate id-language pairs and cross-language fact differences", async () => {
  const duplicate = makeReport("2026-09-15", "en");
  assert.throws(() => assertThreatReportConsistency([duplicate, { ...duplicate, sourcePath: "duplicate/en.md" }]), /Duplicate threat report/);

  await withTempDirectory(async (directory) => {
    await writeTranslations(directory, "2026-09-15", { en: "tags: [different-tag]" });
    await assert.rejects(() => collectThreatReports(directory), /Inconsistent threat report fact tags/);
  });
});

test("parses generator metadata and enforces it across translations", async () => {
  const source = reportMarkdown("2026-09-15", "en").replace("generated: true", "generated: true\ngenerator: ChatGPT\nmodel: GPT-5.6 Sol");
  const report = await createThreatReport("source/_threats/2026-09-15/en.md", parseFrontMatter(source), []);
  assert.equal(report.generator, "ChatGPT");
  assert.equal(report.model, "GPT-5.6 Sol");

  const reference = makeReport("2026-09-15", "en");
  const translated = { ...makeReport("2026-09-15", "ja"), generator: "Other generator" };
  assert.throws(() => assertThreatReportConsistency([reference, translated]), /Inconsistent threat report fact generator/);
});

test("renders Threat facts, event boundaries, native details, and quiet section labels", async () => {
  const result = await renderMarkdown(
    `## Changes since yesterday\n\n- **NEW:** A new exploit was observed.\n- **ONGOING:** Monitoring continues.\n\n## Priority actions\n\n- **Immediate:** Patch the affected service.\n- **Monitor:** Review telemetry.\n\n### Example event\n\n> Why it matters\n\n**Severity:** Critical  \n**CVE:** CVE-2026-12345  \n**Affected:** Example product\n\n#### IOC\n\n- \`evil.example.com\`\n\n#### Impact\n\nThe impact is limited.`,
    { variant: "threat" }
  );

  assert.equal(result.html.includes('<section class="threat-event">'), true);
  assert.equal(result.html.includes('<dl class="threat-fact-grid">'), true);
  assert.equal(result.html.includes('<details class="threat-details">'), true);
  assert.equal(result.html.includes('class="threat-change-list"'), true);
  assert.equal(result.html.includes('class="threat-action-list"'), true);
  assert.equal(result.html.includes('class="threat-section-heading'), true);
  assert.equal(result.html.includes("<h4>Impact</h4>"), true);
  assert.equal(
    result.toc.every((item) => item.level === 2 || item.level === 3),
    true
  );
});

test("leaves ordinary Markdown rendering outside the Threat variant", async () => {
  const result = await renderMarkdown("### Event\n\n#### Details\n\nText");
  assert.equal(result.html.includes('class="threat-event"'), false);
  assert.equal(result.html.includes("<h4>Details</h4>"), true);
});

test("rejects invalid counts and overlong summaries", async () => {
  await assert.rejects(
    () => createThreatReport("source/_threats/2026-09-15/en.md", parseFrontMatter(reportMarkdown("2026-09-15", "en", "critical: -1")), []),
    /non-negative integer/
  );
  await assert.rejects(
    () => createThreatReport("source/_threats/2026-09-15/en.md", parseFrontMatter(reportMarkdown("2026-09-15", "en", "exploited: 12")), []),
    /exploited cannot exceed total/
  );
  const overlong = reportMarkdown("2026-09-15", "en").replace('summary: "Today\'s high-risk events."', `summary: "${"x".repeat(501)}"`);
  await assert.rejects(() => createThreatReport("source/_threats/2026-09-15/en.md", parseFrontMatter(overlong), []), /summary is too long/);
});

test("generates language-specific lists, details, navigation, and language switches", async () => {
  const reports = THREAT_LANGUAGES.flatMap((language) => [makeReport("2026-09-15", language), makeReport("2026-09-14", language)]);
  const content = makeContent(reports);
  const routes = buildRoutes(content);

  for (const language of THREAT_LANGUAGES) {
    const list = routes.find((route) => route.route === (language === "ja" ? "/threats/" : `/threats/${language}/`));
    assert.equal(list?.language, language);
    assert.equal(list?.kind, "threats");
    assert.equal(
      routes.some((route) => route.route === threatReportRoute(language, "2026-09-15") && route.kind === "threat-report"),
      true
    );
  }

  const enRoute = routes.find((route) => route.route === "/threats/en/2026-09-15/") as RouteEntry;
  const payload = routePayload(content, enRoute, { commonContent: { config: content.config, stats: content.stats }, includeArticleBody: true });
  assert.equal(payload.threatReport?.language, "en");
  assert.equal(payload.previousThreatReport?.route, "/threats/en/2026-09-14/");
  assert.equal(payload.nextThreatReport, undefined);
  assert.deepEqual(
    payload.threatReportTranslations?.map((report) => report.route).sort(),
    ["/threats/zh-Hans/2026-09-15/", "/threats/en/2026-09-15/", "/threats/2026-09-15/"].sort()
  );

  const translations = threatTranslationsForReport(content.threatReports, "2026-09-15").filter((report) => report.language !== "en");
  assert.deepEqual(translations.map((report) => report.route).sort(), ["/threats/zh-Hans/2026-09-15/", "/threats/2026-09-15/"].sort());
});

test("emits canonical, hreflang, x-default, and language-specific sitemap entries", () => {
  const content = makeContent(THREAT_LANGUAGES.map((language) => makeReport("2026-09-15", language)));
  const routes = buildRoutes(content);
  const enRoute = routes.find((route) => route.route === "/threats/en/2026-09-15/") as RouteEntry;
  const html = renderHtmlShell({
    appHtml: "<main>Threat</main>",
    assets: { scripts: [], styles: [] },
    content,
    pagePayload: { route: enRoute, threatReport: content.threatReports.find((report) => report.language === "en") },
    route: enRoute
  });
  assert.equal(html.includes('<link rel="canonical" href="https://asutorufa.com/threats/en/2026-09-15/"'), true);
  assert.equal(hasAlternate(html, "zh-Hans", "https://asutorufa.com/threats/zh-Hans/2026-09-15/"), true);
  assert.equal(hasAlternate(html, "en", "https://asutorufa.com/threats/en/2026-09-15/"), true);
  assert.equal(hasAlternate(html, "ja", "https://asutorufa.com/threats/2026-09-15/"), true);
  assert.equal(hasAlternate(html, "x-default", "https://asutorufa.com/threats/2026-09-15/"), true);
  assert.equal(html.includes('type="application/rss+xml"'), true);
  assert.equal(html.includes("https://asutorufa.com/threats/en/rss.xml"), true);
  assert.equal(html.includes('name="keywords" content="CVE-2026-12345, CVE-2026-23456, ransomware, supply-chain, zero-day"'), true);
  assert.equal(html.includes('property="og:image" content="https://asutorufa.com/threats/en/2026-09-15/og.png"'), true);
  assert.equal(html.includes('name="twitter:card" content="summary_large_image"'), true);

  const sitemap = sitemapXml(content, routes);
  for (const language of THREAT_LANGUAGES) {
    assert.equal(sitemap.includes(`https://asutorufa.com${threatReportRoute(language, "2026-09-15")}`), true);
  }
});

test("generates an isolated RSS feed for each threat language", () => {
  const reports = THREAT_LANGUAGES.map((language) => makeReport("2026-09-15", language));
  const content = makeContent(reports);

  assert.equal(threatFeedRoute("ja"), "/threats/rss.xml");
  assert.equal(threatFeedRoute("en"), "/threats/en/rss.xml");
  assert.equal(threatFeedRoute("zh-Hans"), "/threats/zh-Hans/rss.xml");
  const feed = threatFeedXml(content, "en");
  assert.equal(feed.includes("Threat Intelligence Daily · 2026-09-15 (en)"), true);
  assert.equal(feed.includes("Threat Intelligence Daily · 2026-09-15 (ja)"), false);
  assert.equal(feed.includes("/threats/en/2026-09-15/"), true);
});

test("keeps threat intelligence isolated from ordinary blog indexes, search, and RSS", () => {
  const reports = THREAT_LANGUAGES.map((language) => makeReport("2026-09-15", language));
  const content = makeContent(reports);
  const routes = buildRoutes(content);
  const index = contentIndex(content);

  assert.equal(content.posts.length, 0);
  assert.equal(content.tags.length, 0);
  assert.equal(content.categories.length, 0);
  assert.equal(content.archives.length, 0);
  assert.equal(index.postsByAbbrlink.size, 0);
  assert.equal(index.postsByTag.size, 0);
  assert.equal(index.postsByCategory.size, 0);
  assert.deepEqual(searchRecords(content), []);
  assert.equal(feedXml(content).includes("Threat Intelligence Daily"), false);
  assert.equal(
    routes.some((route) => route.route === "/tags/"),
    true
  );
});

test("creates a second page independently for each language after thirty reports", () => {
  const reports = THREAT_LANGUAGES.flatMap((language) =>
    Array.from({ length: 31 }, (_, index) => {
      const date = new Date(Date.UTC(2026, 8, 15 - index)).toISOString().slice(0, 10);
      return makeReport(date, language);
    })
  );
  const routes = buildRoutes(makeContent(reports));

  for (const language of THREAT_LANGUAGES) {
    const pageTwo = language === "ja" ? "/threats/page/2/" : `/threats/${language}/page/2/`;
    assert.equal(
      routes.some((route) => route.route === pageTwo && route.kind === "threats-page"),
      true
    );
  }
});

async function writeTranslations(directory: string, date: string, overrides: Partial<Record<SiteLanguage, string>> = {}) {
  const reportDirectory = path.join(directory, date);
  await fs.mkdir(reportDirectory, { recursive: true });
  for (const language of THREAT_LANGUAGES) {
    await fs.writeFile(path.join(reportDirectory, `${language}.md`), reportMarkdown(date, language, overrides[language]));
  }
}

async function withTempDirectory<T>(callback: (directory: string) => Promise<T>): Promise<T> {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "asutorufa-threats-"));
  try {
    return await callback(directory);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}

function reportMarkdown(date: string, language: SiteLanguage, override = "") {
  return `---
id: "${date}"
title: "Threat Intelligence Daily · ${date} (${language})"
date: "${date}"
updated: "${date} 23:00:00"
language: ${language}
generated: true
summary: "Today's high-risk events."
tags: [ransomware, zero-day, supply-chain, CVE-2026-12345]
cves: [CVE-2026-12345, CVE-2026-23456]
iocs: [evil.example.com, 203.0.113.20, sha256:012345...]
total: 11
critical: "2"
high: 5
medium: 3
low: 1
exploited: 3
${override}
---

## Today

Public security intelligence.
`;
}

function makeReport(date: string, language: SiteLanguage): ThreatReport {
  return {
    kind: "threat-report",
    sourcePath: `source/_threats/${date}/${language}.md`,
    route: threatReportRoute(language, date) as ThreatReport["route"],
    id: date,
    title: `Threat Intelligence Daily · ${date} (${language})`,
    date,
    updated: `${date} 23:00:00`,
    summary: "Today's high-risk events.",
    tags: ["CVE-2026-12345", "ransomware", "supply-chain", "zero-day"],
    cves: ["CVE-2026-12345", "CVE-2026-23456"],
    iocs: ["203.0.113.20", "evil.example.com", "sha256:012345..."],
    generated: true,
    total: 11,
    critical: 2,
    high: 5,
    medium: 3,
    low: 1,
    exploited: 3,
    language,
    htmlLang: language === "zh-Hans" ? "zh-Hans" : language,
    locale: language === "zh-Hans" ? "zh_CN" : language === "ja" ? "ja_JP" : "en_US",
    textDirection: "ltr",
    dateLocale: language === "zh-Hans" ? "zh-CN" : language === "ja" ? "ja-JP" : "en-US",
    bodyMarkdown: "## Today",
    bodyHtml: "<h2>Today</h2>",
    rawMarkdown: "## Today",
    plainText: "Today",
    toc: [],
    math: false,
    mermaid: false
  };
}

function makeContent(threatReports: ThreatReport[]): ContentManifest {
  return {
    config: {
      title: "Asutorufa's Blog",
      subtitle: "Hello",
      description: "",
      author: "Asutorufa",
      url: "https://asutorufa.com",
      perPage: 10
    },
    stats: {
      posts: 0,
      pages: 0,
      threatReports: new Set(threatReports.map((report) => report.id)).size,
      tags: 0,
      categories: 0,
      archives: 0
    },
    posts: [],
    wipPosts: [],
    pages: [],
    threatReports,
    tags: [],
    categories: [],
    archives: []
  };
}

function hasAlternate(html: string, language: string, href: string) {
  return [...html.matchAll(/<link[^>]*>/g)].some(
    (match) => (match[0].includes(`hreflang="${language}"`) || match[0].includes(`hrefLang="${language}"`)) && match[0].includes(`href="${href}"`)
  );
}
