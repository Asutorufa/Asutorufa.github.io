import fs from "node:fs/promises";
import path from "node:path";
import type { ContentManifest, RouteEntry } from "../../src/types/content";
import type { AppProps } from "../../src/app/app-types";
import { mergePagePayload } from "../../src/app/page-payload";
import { distDir } from "./paths";
import { commonContentForClient, pageForPayload, postForArticlePayload, postForListPayload, readViteAssets, renderHtmlShell, routeOutputFile } from "./html";

export type PageRenderer = (props: AppProps) => string;

export async function renderHtml(content: ContentManifest, routes: RouteEntry[], renderPage: PageRenderer) {
  const manifestPath = path.join(distDir, ".vite/manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as Record<string, { file?: string; css?: string[] }>;
  const assets = readViteAssets(manifest);
  const commonContent = commonContentForClient(content);

  await fs.mkdir(path.join(distDir, "manifest"), { recursive: true });
  await fs.writeFile(
    path.join(distDir, "manifest/common.json"),
    JSON.stringify({
      content: commonContent,
      routes
    })
  );

  for (const route of routes) {
    const payload = routePayload(content, route);
    await writePagePayload(route, payload);

    const appProps = { content: mergePagePayload(commonContent, payload), route };
    const appHtml = renderPage(appProps);
    const html = renderHtmlShell({
      appHtml,
      assets,
      content,
      route
    });
    const outputFile = routeOutputFile(distDir, route.outputPath);
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, html);
  }
}

function routePayload(content: ContentManifest, route: RouteEntry) {
  return {
    route,
    description: routeDescription(content, route),
    post: route.params?.abbrlink ? articlePost(content, route.params.abbrlink) : undefined,
    posts: route.kind === "home" ? homeListPosts(content, route).map(postForListPayload) : undefined,
    page: route.kind === "page" ? pagePayload(content, route.route) : undefined
  };
}

function articlePost(content: ContentManifest, abbrlink: string) {
  const post = content.posts.find((item) => item.abbrlink === abbrlink);
  return post ? postForArticlePayload(post) : undefined;
}

function pagePayload(content: ContentManifest, route: string) {
  const page = content.pages.find((item) => item.route === route);
  return page ? pageForPayload(page) : undefined;
}

function homeListPosts(content: ContentManifest, route: RouteEntry) {
  const page = Number(route.params?.page ?? "1");
  const start = (page - 1) * content.config.perPage;
  return content.posts.slice(start, start + content.config.perPage);
}

async function writePagePayload(route: RouteEntry, payload: unknown) {
  const payloadPath = path.join(distDir, "manifest/pages", `${route.outputPath}.json`);
  await fs.mkdir(path.dirname(payloadPath), { recursive: true });
  await fs.writeFile(payloadPath, JSON.stringify(payload));
}

function routeDescription(content: ContentManifest, route: RouteEntry) {
  if (route.kind === "post" && route.params?.abbrlink) {
    const post = content.posts.find((item) => item.abbrlink === route.params?.abbrlink);
    return post?.plainText.slice(0, 160) ?? content.config.subtitle;
  }
  return content.config.description || content.config.subtitle;
}
