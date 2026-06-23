import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { LANGUAGE_META, normalizeLanguage } from "../../src/data/i18n";
import type { Page, Post } from "../../src/types/content";
import { rootDir, toPosixPath } from "./paths";
import { renderMarkdown, renderMarkdownToHtml } from "./render-markdown";
import { normalizeTaxonomyName, routeSegment as sharedRouteSegment } from "../../src/utils/route";
import type { FrontMatterFile } from "./front-matter";

const MARKDOWN_CACHE_VERSION = 1;
const markdownCacheDir = path.join(rootDir, ".cache/react-blog/markdown");
const AUTO_EXCERPT_LENGTH = 180;

type PostMarkdownRender = {
  excerptMarkdown: string;
  excerptHtml: string;
  moreAnchor?: string;
  bodyMarkdown: string;
  bodyHtml: string;
  plainText: string;
  toc: Post["toc"];
  math: boolean;
  mermaid: boolean;
};

type PageMarkdownRender = {
  bodyHtml: string;
  plainText: string;
};

type MarkdownCacheEntry<T> = {
  version: typeof MARKDOWN_CACHE_VERSION;
  key: string;
  value: T;
};

type MarkdownCacheStats = {
  hits: number;
  misses: number;
  writes: number;
  errors: number;
};

const markdownCacheStats: MarkdownCacheStats = {
  hits: 0,
  misses: 0,
  writes: 0,
  errors: 0
};

let markdownRendererFingerprintPromise: Promise<string> | undefined;

export function asString(value: unknown, fallback = "") {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

export function resetMarkdownCacheStats() {
  markdownCacheStats.hits = 0;
  markdownCacheStats.misses = 0;
  markdownCacheStats.writes = 0;
  markdownCacheStats.errors = 0;
}

export function getMarkdownCacheStats() {
  return { ...markdownCacheStats };
}

export function asStringArray(value: unknown) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => asString(item).trim()).filter(Boolean);
  }
  return [asString(value).trim()].filter(Boolean);
}

export function asBoolean(value: unknown, fallback = false) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "yes", "y", "1", "on"].includes(normalized)) return true;
  if (["false", "no", "n", "0", "off"].includes(normalized)) return false;
  return fallback;
}

export function asTaxonomyArray(value: unknown) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const name of asStringArray(value)) {
    const normalized = normalizeTaxonomyName(name);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(name);
  }

  return result;
}

export function normalizeDate(value: unknown) {
  if (value instanceof Date) {
    return formatDateTime(value);
  }
  return asString(value).trim();
}

export function rawFrontMatterValue(parsed: FrontMatterFile<string>, key: string) {
  const matterSource = String(parsed.matter ?? "");
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
  const moreAnchor = "more";
  if (!match || match.index < 1) {
    return {
      excerptMarkdown: makeAutoExcerptMarkdown(markdown),
      bodyMarkdown: markdown
    };
  }
  return {
    excerptMarkdown: markdown.slice(0, match.index).trim(),
    moreAnchor,
    bodyMarkdown: markdown.replace(marker, `<span id="${moreAnchor}" class="post-more-anchor" aria-hidden="true"></span>`).trim()
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

function makeAutoExcerptMarkdown(markdown: string) {
  const cleaned = mapOutsideMath(markdown, (text) =>
    text
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
      .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
      .replace(/<[^>]+>/g, " ")
      .replace(/[#>*_~|`]/g, " ")
  )
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return truncateMarkdownPreservingMath(cleaned, AUTO_EXCERPT_LENGTH);
}

function truncateMarkdownPreservingMath(markdown: string, maxLength: number) {
  if (markdown.length <= maxLength) return markdown;

  let result = "";
  for (const segment of mathSegments(markdown)) {
    if (result.length + segment.text.length <= maxLength) {
      result += segment.text;
      continue;
    }

    if (segment.math) break;

    const remaining = maxLength - result.length;
    if (remaining > 0) {
      result += truncateTextSegment(segment.text, remaining);
    }
    break;
  }

  return result.trim();
}

function truncateTextSegment(text: string, maxLength: number) {
  const slice = text.slice(0, maxLength);
  const lastWhitespace = slice.search(/\s+\S*$/);
  const truncated = lastWhitespace > maxLength * 0.55 ? slice.slice(0, lastWhitespace) : slice;
  return truncated.replace(/[\s,.;:，。；：、]+$/u, "");
}

function mapOutsideMath(markdown: string, transform: (text: string) => string) {
  return mathSegments(markdown)
    .map((segment) => (segment.math ? segment.text : transform(segment.text)))
    .join("");
}

function mathSegments(markdown: string) {
  const segments: Array<{ text: string; math: boolean }> = [];
  let index = 0;

  while (index < markdown.length) {
    const start = findNextMathDelimiter(markdown, index);
    if (start < 0) {
      segments.push({ text: markdown.slice(index), math: false });
      break;
    }

    if (start > index) {
      segments.push({ text: markdown.slice(index, start), math: false });
    }

    const delimiter = markdown.startsWith("$$", start) ? "$$" : "$";
    const end = findClosingMathDelimiter(markdown, start + delimiter.length, delimiter);
    if (end < 0) {
      segments.push({ text: markdown.slice(start), math: false });
      break;
    }

    segments.push({ text: markdown.slice(start, end + delimiter.length), math: true });
    index = end + delimiter.length;
  }

  return segments;
}

function findNextMathDelimiter(value: string, start: number) {
  for (let index = start; index < value.length; index += 1) {
    if (value[index] === "$" && !isEscaped(value, index)) return index;
  }
  return -1;
}

function findClosingMathDelimiter(value: string, start: number, delimiter: "$" | "$$") {
  for (let index = start; index < value.length; index += 1) {
    if (value.startsWith(delimiter, index) && !isEscaped(value, index)) return index;
  }
  return -1;
}

function isEscaped(value: string, index: number) {
  let backslashes = 0;
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === "\\"; cursor -= 1) {
    backslashes += 1;
  }
  return backslashes % 2 === 1;
}

export function detectMath(data: Record<string, unknown>, markdown: string) {
  if (data.mathjax === true || data.katex === true || data.math === true) return true;
  return /\$\$[\s\S]+?\$\$/.test(markdown);
}

export function detectMermaid(markdown: string) {
  return /```mermaid[\s\S]*?```/i.test(markdown);
}

export function languageFields(sourcePath: string, rawLanguage: unknown, fallbackCollector: Array<{ sourcePath: string; rawLanguage: string }>) {
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
  parsed: FrontMatterFile<string>,
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
  const wip = asBoolean(data.wip);
  const route = postRoute(abbrlink, wip);
  const rendered = await renderPostMarkdownWithCache(sourcePath, parsed, data, route);
  const language = languageFields(sourcePath, data.language, fallbackCollector);

  return {
    kind: "post",
    sourcePath,
    route,
    abbrlink,
    title,
    date,
    updated,
    tags: asTaxonomyArray(data.tags),
    categories: asTaxonomyArray(data.categories),
    ...language,
    excerptMarkdown: rendered.excerptMarkdown,
    excerptHtml: rendered.excerptHtml,
    moreAnchor: rendered.moreAnchor,
    bodyMarkdown: rendered.bodyMarkdown,
    bodyHtml: rendered.bodyHtml,
    rawMarkdown: parsed.content,
    plainText: rendered.plainText,
    toc: rendered.toc,
    slugForSearch: abbrlink,
    wip,
    comments: !wip && data.comments !== false,
    math: rendered.math,
    mermaid: rendered.mermaid
  };
}

function postRoute(abbrlink: string, wip: boolean): Post["route"] {
  return wip ? `/wip/${abbrlink}/` : `/posts/${abbrlink}/`;
}

export async function createPage(
  filePath: string,
  parsed: FrontMatterFile<string>,
  fallbackCollector: Array<{ sourcePath: string; rawLanguage: string }>
): Promise<Page | null> {
  const route = pageRouteForSource(filePath);
  if (!route) return null;

  const sourcePath = toPosixPath(filePath);
  const data = parsed.data as Record<string, unknown>;
  const language = languageFields(sourcePath, data.language, fallbackCollector);
  const rendered = await renderPageMarkdownWithCache(sourcePath, parsed);

  return {
    kind: "page",
    sourcePath,
    route,
    title: asString(data.title, route.replaceAll("/", "") || "Page"),
    date: rawFrontMatterValue(parsed, "date") || normalizeDate(data.date),
    updated: rawFrontMatterValue(parsed, "updated") || normalizeDate(data.updated),
    ...language,
    bodyMarkdown: parsed.content.trim(),
    bodyHtml: rendered.bodyHtml,
    rawMarkdown: parsed.content,
    plainText: rendered.plainText,
    comments: data.comments !== false
  };
}

async function renderPostMarkdownWithCache(sourcePath: string, parsed: FrontMatterFile<string>, data: Record<string, unknown>, route: Post["route"]) {
  const key = await markdownCacheKey("post", parsed);
  const cachePath = markdownCachePath("post", sourcePath);
  const cached = await readMarkdownCache<PostMarkdownRender>(cachePath, key);
  if (cached) return cached;

  const value = await renderPostMarkdown(parsed, data, route);
  await writeMarkdownCache(cachePath, key, value);
  return value;
}

async function renderPageMarkdownWithCache(sourcePath: string, parsed: FrontMatterFile<string>) {
  const key = await markdownCacheKey("page", parsed);
  const cachePath = markdownCachePath("page", sourcePath);
  const cached = await readMarkdownCache<PageMarkdownRender>(cachePath, key);
  if (cached) return cached;

  const bodyMarkdown = parsed.content.trim();
  const value = {
    bodyHtml: await renderMarkdownToHtml(bodyMarkdown),
    plainText: makePlainText(parsed.content)
  };
  await writeMarkdownCache(cachePath, key, value);
  return value;
}

async function renderPostMarkdown(parsed: FrontMatterFile<string>, data: Record<string, unknown>, route: Post["route"]): Promise<PostMarkdownRender> {
  const { excerptMarkdown, moreAnchor, bodyMarkdown } = splitExcerpt(parsed.content.trim());
  const markdownOptions = { assetBasePath: route };
  const excerptHtml = excerptMarkdown ? await renderMarkdownToHtml(excerptMarkdown, markdownOptions) : "";
  const body = await renderMarkdown(bodyMarkdown, markdownOptions);

  return {
    excerptMarkdown,
    excerptHtml,
    moreAnchor,
    bodyMarkdown,
    bodyHtml: body.html,
    plainText: makePlainText(parsed.content),
    toc: body.toc,
    math: detectMath(data, parsed.content),
    mermaid: detectMermaid(parsed.content)
  };
}

async function readMarkdownCache<T>(cachePath: string, key: string): Promise<T | undefined> {
  try {
    const entry = JSON.parse(await fs.readFile(cachePath, "utf8")) as Partial<MarkdownCacheEntry<T>>;
    if (entry.version === MARKDOWN_CACHE_VERSION && entry.key === key && entry.value) {
      markdownCacheStats.hits += 1;
      return entry.value;
    }
  } catch {
    // Missing or malformed cache entries are normal after content or renderer changes.
  }

  markdownCacheStats.misses += 1;
  return undefined;
}

async function writeMarkdownCache<T>(cachePath: string, key: string, value: T) {
  try {
    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    const entry: MarkdownCacheEntry<T> = {
      version: MARKDOWN_CACHE_VERSION,
      key,
      value
    };
    await fs.writeFile(cachePath, `${JSON.stringify(entry)}\n`);
    markdownCacheStats.writes += 1;
  } catch {
    markdownCacheStats.errors += 1;
  }
}

async function markdownCacheKey(kind: "page" | "post", parsed: FrontMatterFile<string>) {
  const hash = createHash("sha256");
  hash.update(String(MARKDOWN_CACHE_VERSION));
  hash.update("\0");
  hash.update(kind);
  hash.update("\0");
  hash.update(await markdownRendererFingerprint());
  hash.update("\0");
  hash.update(String(parsed.matter ?? ""));
  hash.update("\0");
  hash.update(parsed.content);
  return hash.digest("hex");
}

function markdownCachePath(kind: "page" | "post", sourcePath: string) {
  const sourceHash = createHash("sha256").update(sourcePath).digest("hex");
  return path.join(markdownCacheDir, kind, `${sourceHash}.json`);
}

async function markdownRendererFingerprint() {
  markdownRendererFingerprintPromise ??= createMarkdownRendererFingerprint();
  return markdownRendererFingerprintPromise;
}

async function createMarkdownRendererFingerprint() {
  const files = ["tools/react-blog/render-markdown.ts", "tools/react-blog/content-utils.ts", "package-lock.json"];
  const hash = createHash("sha256");

  for (const file of files) {
    try {
      hash.update(file);
      hash.update("\0");
      hash.update(await fs.readFile(path.join(rootDir, file)));
      hash.update("\0");
    } catch {
      hash.update("missing");
      hash.update("\0");
    }
  }

  return hash.digest("hex");
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
