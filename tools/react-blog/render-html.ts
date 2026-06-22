import fs from "node:fs/promises";
import path from "node:path";
import type { ContentManifest, RouteEntry } from "../../src/types/content";
import type { AppProps } from "../../src/app/app-types";
import { mergePagePayload } from "../../src/app/page-payload";
import { distDir } from "./paths";
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

export async function renderHtml(content: ContentManifest, routes: RouteEntry[], renderPage: PageRenderer) {
  const manifestPath = path.join(distDir, ".vite/manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as Record<string, { file?: string; css?: string[] }>;
  const assets = readViteAssets(manifest);
  const commonContent = commonContentForClient(content);

  for (const route of routes) {
    const payload = routePayload(content, route, { includeArticleBody: true });
    const embeddedPayload = routePayload(content, route, { includeArticleBody: false });

    const appProps = { content: mergePagePayload(commonContent, payload), route };
    const appHtml = renderPage(appProps);
    const html = renderHtmlShell({
      appHtml,
      assets,
      content,
      pagePayload: embeddedPayload,
      route
    });
    const outputFile = routeOutputFile(distDir, route.outputPath);
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, html);
  }
}

function routePayload(content: ContentManifest, route: RouteEntry, options: { includeArticleBody: boolean }) {
  const list = listPosts(content, route);
  const article = route.params?.abbrlink ? articlePosts(content, route.params.abbrlink, options) : undefined;
  return {
    route,
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

function articlePosts(content: ContentManifest, abbrlink: string, options: { includeArticleBody: boolean }) {
  const index = content.posts.findIndex((item) => item.abbrlink === abbrlink);
  const post = content.posts[index];
  if (!post) return undefined;

  return {
    newerPost: content.posts[index - 1] ? postForAdjacentPayload(content.posts[index - 1]) : undefined,
    post: options.includeArticleBody ? postForArticlePayload(post) : postForEmbeddedArticlePayload(post),
    olderPost: content.posts[index + 1] ? postForAdjacentPayload(content.posts[index + 1]) : undefined
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
  return content.config.description || content.config.subtitle;
}
