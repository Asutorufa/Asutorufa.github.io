import path from "node:path";
import type { GrayMatterFile } from "gray-matter";
import { LANGUAGE_META, normalizeLanguage } from "../../src/data/i18n";
import type { Page, Post, SiteLanguage } from "../../src/types/content";
import { toPosixPath } from "./paths";
import { renderMarkdown, renderMarkdownToHtml } from "./render-markdown";
import { routeSegment as sharedRouteSegment } from "../../src/utils/route";

export function asString(value: unknown, fallback = "") {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

export function asStringArray(value: unknown) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => asString(item).trim()).filter(Boolean);
  }
  return [asString(value).trim()].filter(Boolean);
}

export function normalizeDate(value: unknown) {
  if (value instanceof Date) {
    return formatDateTime(value);
  }
  return asString(value).trim();
}

export function rawFrontMatterValue(parsed: GrayMatterFile<string>, key: string) {
  const matterSource = String((parsed as GrayMatterFile<string> & { matter?: string }).matter ?? "");
  const match = new RegExp(`^${key}:\\s*['"]?([^'"\\n#]*)['"]?\\s*(?:#.*)?$`, "m").exec(matterSource);
  return match?.[1]?.trim() ?? "";
}

export function formatDate(value?: string) {
  if (!value) return "";
  const date = parseLooseDate(value);
  if (!date) return value.slice(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLooseDate(value?: string) {
  if (!value) return null;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function comparePostsByDateDesc(a: Post, b: Post) {
  const aDate = parseLooseDate(a.date)?.getTime() ?? 0;
  const bDate = parseLooseDate(b.date)?.getTime() ?? 0;
  return bDate - aDate;
}

export function splitExcerpt(markdown: string) {
  const marker = /<!--\s*more\s*-->/i;
  const match = marker.exec(markdown);
  if (!match || match.index < 1) {
    return {
      excerptMarkdown: makePlainText(markdown).slice(0, 180),
      bodyMarkdown: markdown
    };
  }
  return {
    excerptMarkdown: markdown.slice(0, match.index).trim(),
    bodyMarkdown: markdown.replace(marker, "").trim()
  };
}

export function makePlainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectMath(data: Record<string, unknown>, markdown: string) {
  if (data.mathjax === true || data.katex === true || data.math === true) return true;
  return /\$\$[\s\S]+?\$\$/.test(markdown);
}

export function detectMermaid(markdown: string) {
  return /```mermaid[\s\S]*?```/i.test(markdown);
}

export function languageFields(
  sourcePath: string,
  rawLanguage: unknown,
  fallbackCollector: Array<{ sourcePath: string; rawLanguage: string }>
) {
  const normalized = normalizeLanguage(rawLanguage);
  if (normalized.fallback) {
    fallbackCollector.push({
      sourcePath,
      rawLanguage: normalized.rawLanguage
    });
  }
  const meta = LANGUAGE_META[normalized.language];
  return {
    language: normalized.language,
    htmlLang: meta.htmlLang,
    locale: meta.locale,
    textDirection: meta.textDirection,
    dateLocale: meta.dateLocale
  };
}

export function routeSegment(name: string) {
  return sharedRouteSegment(name);
}

export function pageRouteForSource(sourcePath: string) {
  const normalized = toPosixPath(sourcePath);
  const match = normalized.match(/^source\/(.+)\/index\.md$/);
  if (!match) return null;
  return `/${match[1]}/`;
}

export async function createPost(
  filePath: string,
  parsed: GrayMatterFile<string>,
  fallbackCollector: Array<{ sourcePath: string; rawLanguage: string }>
): Promise<Post> {
  const sourcePath = toPosixPath(filePath);
  const data = parsed.data as Record<string, unknown>;
  const abbrlink = asString(data.abbrlink).trim();
  if (!abbrlink) {
    throw new Error(`Missing abbrlink in ${sourcePath}`);
  }

  const title = asString(data.title, path.basename(filePath, ".md")).trim();
  const date = rawFrontMatterValue(parsed, "date") || normalizeDate(data.date);
  const updated = rawFrontMatterValue(parsed, "updated") || normalizeDate(data.updated) || date;
  const { excerptMarkdown, bodyMarkdown } = splitExcerpt(parsed.content.trim());
  const excerptHtml = excerptMarkdown ? await renderMarkdownToHtml(excerptMarkdown) : "";
  const body = await renderMarkdown(bodyMarkdown);
  const language = languageFields(sourcePath, data.language, fallbackCollector);

  return {
    kind: "post",
    sourcePath,
    route: `/posts/${abbrlink}/`,
    abbrlink,
    title,
    date,
    updated,
    tags: asStringArray(data.tags),
    categories: asStringArray(data.categories),
    ...language,
    excerptMarkdown,
    excerptHtml,
    bodyMarkdown,
    bodyHtml: body.html,
    rawMarkdown: parsed.content,
    plainText: makePlainText(parsed.content),
    toc: body.toc,
    slugForSearch: abbrlink,
    comments: data.comments !== false,
    math: detectMath(data, parsed.content),
    mermaid: detectMermaid(parsed.content)
  };
}

export async function createPage(
  filePath: string,
  parsed: GrayMatterFile<string>,
  fallbackCollector: Array<{ sourcePath: string; rawLanguage: string }>
): Promise<Page | null> {
  const route = pageRouteForSource(filePath);
  if (!route) return null;

  const sourcePath = toPosixPath(filePath);
  const data = parsed.data as Record<string, unknown>;
  const language = languageFields(sourcePath, data.language, fallbackCollector);

  return {
    kind: "page",
    sourcePath,
    route,
    title: asString(data.title, route.replaceAll("/", "") || "Page"),
    date: rawFrontMatterValue(parsed, "date") || normalizeDate(data.date),
    updated: rawFrontMatterValue(parsed, "updated") || normalizeDate(data.updated),
    ...language,
    bodyMarkdown: parsed.content.trim(),
    bodyHtml: await renderMarkdownToHtml(parsed.content.trim()),
    rawMarkdown: parsed.content,
    plainText: makePlainText(parsed.content),
    comments: data.comments !== false
  };
}

function formatDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
