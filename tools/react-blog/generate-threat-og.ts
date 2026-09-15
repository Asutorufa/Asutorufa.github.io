import fs from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import type { ContentManifest, SiteLanguage, ThreatReport } from "../../src/types/content";
import { escapeHtml } from "./html";
import { distDir } from "./paths";

const WIDTH = 1200;
const HEIGHT = 630;

export async function generateThreatOgImages(content: ContentManifest) {
  await Promise.all(content.threatReports.map((report) => generateThreatOgImage(report)));
}

async function generateThreatOgImage(report: ThreatReport) {
  const outputPath = path.join(distDir, report.route.replace(/^\//, ""), "og.png");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const image = new Resvg(threatOgSvg(report), { fitTo: { mode: "original" } }).render().asPng();
  await fs.writeFile(outputPath, image);
}

function threatOgSvg(report: ThreatReport) {
  const labels = ogLabels(report.language);
  const cves = report.cves.slice(0, 3).join("   ·   ");
  const facts = [`${report.critical} ${labels.critical}`, `${report.exploited} ${labels.exploited}`, `${report.total} ${labels.events}`];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="1200" height="630" fill="#f7f7f7" />
  <rect x="76" y="76" width="8" height="478" rx="4" fill="#b06a3b" />
  <text x="124" y="132" fill="#8f512f" font-family="Inter, Arial, sans-serif" font-size="25" font-weight="600" letter-spacing="2">${escapeHtml(labels.title)}</text>
  <text x="124" y="232" fill="#282828" font-family="Inter, Arial, sans-serif" font-size="62" font-weight="650">${escapeHtml(report.date)}</text>
  <line x1="124" y1="276" x2="1076" y2="276" stroke="#d8d8d8" stroke-width="2" />
  <text x="124" y="348" fill="#555555" font-family="Inter, Arial, sans-serif" font-size="28">${facts.map(escapeHtml).join("   ·   ")}</text>
  ${cves ? `<text x="124" y="438" fill="#777777" font-family="JetBrains Mono, Consolas, monospace" font-size="23">${escapeHtml(cves)}</text>` : ""}
  <text x="124" y="526" fill="#999999" font-family="Inter, Arial, sans-serif" font-size="21">${escapeHtml(report.title)}</text>
</svg>`;
}

function ogLabels(language: SiteLanguage) {
  switch (language) {
    case "ja":
      return { title: "脅威インテリジェンス", critical: "Critical", exploited: "悪用確認", events: "脅威" };
    case "zh-Hans":
      return { title: "威胁情报", critical: "严重", exploited: "已遭利用", events: "事件" };
    default:
      return { title: "Threat Intelligence", critical: "Critical", exploited: "Exploited", events: "Events" };
  }
}
