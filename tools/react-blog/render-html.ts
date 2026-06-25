import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import fg from "fast-glob";
import type { ContentManifest, RouteEntry } from "../../src/types/content";
import type { AppProps } from "../../src/app/app-types";
import { mergePagePayload } from "../../src/app/page-payload";
import { distDir, rootDir } from "./paths";
import { buildConcurrency, mapConcurrent } from "./concurrency";
import {
  commonContentForClient,
  pageForPayload,
  postForAdjacentPayload,
  postForArticlePayload,
  postForEmbeddedArticlePayload,
  postForListPayload,
  readViteAssets,
  renderHtmlShell,
  routeOutputFile
} from "./html";

export type PageRenderer = (props: AppProps) => string;
export type PageRendererLoader = () => Promise<PageRenderer>;

type HtmlCacheEntry = {
  version: typeof HTML_CACHE_VERSION;
  key: string;
  html: string;
};

type HtmlCacheStats = {
  hits: number;
  misses: number;
  writes: number;
  errors: number;
};

const HTML_CACHE_VERSION = 1;
const htmlCacheDir = path.join(rootDir, ".cache/react-blog/html");

const htmlCacheStats: HtmlCacheStats = {
  hits: 0,
  misses: 0,
  writes: 0,
  errors: 0
};

export async function renderHtml(content: ContentManifest, routes: RouteEntry[], loadRenderPage: PageRendererLoader) {
  resetHtmlCacheStats();
  const manifestPath = path.join(distDir, ".vite/manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as Record<string, { file?: string; css?: string[] }>;
  const assets = readViteAssets(manifest);
  const commonContent = commonContentForClient(content);
  const concurrency = buildConcurrency();
  const rendererFingerprint = await createHtmlRendererFingerprint(manifest);

  await mapConcurrent(routes, concurrency, async (route) => {
    const payload = routePayload(content, route, { commonContent, includeArticleBody: true });
    const embeddedPayload = routePayload(content, route, { commonContent, includeArticleBody: false });
    const outputFile = routeOutputFile(distDir, route.outputPath);
    const cacheKey = routeCacheKey(route, payload, rendererFingerprint);
    const cachedHtml = await readHtmlCache(route.outputPath, cacheKey);

    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    if (cachedHtml) {
      await fs.writeFile(outputFile, cachedHtml);
      return;
    }

    const renderPage = await loadRenderPage();
    const appProps = { content: mergePagePayload(commonContent, payload), route };
    const appHtml = renderPage(appProps);
    const html = renderHtmlShell({
      appHtml,
      assets,
      content,
      pagePayload: embeddedPayload,
      route
    });
    await fs.writeFile(outputFile, html);
    await writeHtmlCache(route.outputPath, cacheKey, html);
  });
}

export function getHtmlCacheStats() {
  return { ...htmlCacheStats };
}

function resetHtmlCacheStats() {
  htmlCacheStats.hits = 0;
  htmlCacheStats.misses = 0;
  htmlCacheStats.writes = 0;
  htmlCacheStats.errors = 0;
}

function routePayload(
  content: ContentManifest,
  route: RouteEntry,
  options: { commonContent: ReturnType<typeof commonContentForClient>; includeArticleBody: boolean }
) {
  const list = listPosts(content, route);
  const article = route.params?.abbrlink ? articlePosts(content, route, options) : undefined;
  return {
    route,
    commonContent: options.commonContent,
    description: routeDescription(content, route),
    post: article?.post,
    newerPost: article?.newerPost,
    olderPost: article?.olderPost,
    posts: list?.posts.map(postForListPayload),
    totalPages: list?.totalPages,
    totalPosts: list?.totalPosts,
    page: route.kind === "page" ? pagePayload(content, route.route, options) : undefined,
    tags: route.kind === "tags" ? content.tags : undefined,
    categories: route.kind === "categories" ? content.categories : undefined,
    archives: route.kind === "archives" ? content.archives : undefined
  };
}

function articlePosts(content: ContentManifest, route: RouteEntry, options: { includeArticleBody: boolean }) {
  const abbrlink = route.params?.abbrlink ?? "";
  const posts = route.kind === "wip-post" ? content.wipPosts : content.posts;
  const index = posts.findIndex((item) => item.abbrlink === abbrlink);
  const post = posts[index];
  if (!post) return undefined;

  return {
    newerPost: posts[index - 1] ? postForAdjacentPayload(posts[index - 1]) : undefined,
    post: options.includeArticleBody ? postForArticlePayload(post) : postForEmbeddedArticlePayload(post),
    olderPost: posts[index + 1] ? postForAdjacentPayload(posts[index + 1]) : undefined
  };
}

function pagePayload(content: ContentManifest, route: string, options: { includeArticleBody: boolean }) {
  const page = content.pages.find((item) => item.route === route);
  return page ? pageForPayload(page, { bodyHtml: options.includeArticleBody ? page.bodyHtml : "" }) : undefined;
}

function listPosts(content: ContentManifest, route: RouteEntry) {
  const posts = postsForListRoute(content, route);
  if (!posts) return undefined;

  const page = Number(route.params?.page ?? "1");
  const totalPosts = posts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / content.config.perPage));
  const start = (page - 1) * content.config.perPage;
  return {
    posts: posts.slice(start, start + content.config.perPage),
    totalPages,
    totalPosts
  };
}

function postsForListRoute(content: ContentManifest, route: RouteEntry) {
  switch (route.kind) {
    case "wip":
      return content.wipPosts;
    case "home":
    case "archives":
    case "archives-page":
      return content.posts;
    case "archive-year":
    case "archive-year-page":
      return content.posts.filter((post) => post.date.startsWith(route.params?.year ?? ""));
    case "archive-month":
    case "archive-month-page":
      return content.posts.filter((post) => post.date.startsWith(`${route.params?.year ?? ""}-${route.params?.month ?? ""}`));
    case "tag":
    case "tag-page":
      return content.posts.filter((post) => post.tags.includes(route.params?.tag ?? ""));
    case "category":
    case "category-page":
      return content.posts.filter((post) => post.categories.includes(route.params?.category ?? ""));
    default:
      return undefined;
  }
}

function routeDescription(content: ContentManifest, route: RouteEntry) {
  if (route.kind === "post" && route.params?.abbrlink) {
    const post = content.posts.find((item) => item.abbrlink === route.params?.abbrlink);
    return post?.plainText.slice(0, 160) ?? content.config.subtitle;
  }
  if (route.kind === "wip-post" && route.params?.abbrlink) {
    const post = content.wipPosts.find((item) => item.abbrlink === route.params?.abbrlink);
    return post?.plainText.slice(0, 160) ?? content.config.subtitle;
  }
  return content.config.description || content.config.subtitle;
}

function routeCacheKey(route: RouteEntry, embeddedPayload: unknown, rendererFingerprint: string) {
  return createHash("sha256")
    .update(String(HTML_CACHE_VERSION))
    .update("\0")
    .update(rendererFingerprint)
    .update("\0")
    .update(route.outputPath)
    .update("\0")
    .update(JSON.stringify(route))
    .update("\0")
    .update(JSON.stringify(embeddedPayload))
    .digest("hex");
}

async function readHtmlCache(outputPath: string, key: string) {
  try {
    const entry = JSON.parse(await fs.readFile(htmlCachePath(outputPath), "utf8")) as Partial<HtmlCacheEntry>;
    if (entry.version === HTML_CACHE_VERSION && entry.key === key && typeof entry.html === "string") {
      htmlCacheStats.hits += 1;
      return entry.html;
    }
  } catch {
    // Missing or malformed route HTML cache entries are treated as cache misses.
  }

  htmlCacheStats.misses += 1;
  return undefined;
}

async function writeHtmlCache(outputPath: string, key: string, html: string) {
  try {
    const cachePath = htmlCachePath(outputPath);
    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    const entry: HtmlCacheEntry = {
      version: HTML_CACHE_VERSION,
      key,
      html
    };
    await fs.writeFile(cachePath, `${JSON.stringify(entry)}\n`);
    htmlCacheStats.writes += 1;
  } catch {
    htmlCacheStats.errors += 1;
  }
}

function htmlCachePath(outputPath: string) {
  const outputHash = createHash("sha256").update(outputPath).digest("hex");
  return path.join(htmlCacheDir, `${outputHash}.json`);
}

async function createHtmlRendererFingerprint(manifest: unknown) {
  const files = await fg(["src/**/*", "tools/react-blog/html.tsx", "tools/react-blog/render-html.ts", "package-lock.json"], {
    absolute: false,
    cwd: rootDir,
    dot: true,
    ignore: ["src/generated/**"],
    onlyFiles: true
  });
  const hash = createHash("sha256");
  hash.update(String(HTML_CACHE_VERSION));
  hash.update("\0");
  hash.update(JSON.stringify(manifest));
  hash.update("\0");

  for (const filePath of files.sort()) {
    hash.update(filePath);
    hash.update("\0");
    hash.update(await fs.readFile(path.join(rootDir, filePath)));
    hash.update("\0");
  }

  return hash.digest("hex");
}
