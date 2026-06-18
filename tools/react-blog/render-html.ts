import fs from "node:fs/promises";
import path from "node:path";
import type { ContentManifest, RouteEntry } from "../../src/types/content";
import { renderPage } from "../../src/app/render-page";
import { distDir } from "./paths";
import { pruneForClient, readViteAssets, renderHtmlShell, routeOutputFile } from "./html";

export async function renderHtml(content: ContentManifest, routes: RouteEntry[]) {
  const manifestPath = path.join(distDir, ".vite/manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as Record<string, { file?: string; css?: string[] }>;
  const assets = readViteAssets(manifest);

  await fs.mkdir(path.join(distDir, "manifest"), { recursive: true });

  for (const route of routes) {
    await writePagePayload(route, routePayload(content, route));

    const appProps = { content, route };
    const appHtml = renderPage(appProps);
    const clientData = { content: pruneForClient(content, route), route };
    const html = renderHtmlShell({
      appHtml,
      assets,
      content,
      route,
      clientData
    });
    const outputFile = routeOutputFile(distDir, route.outputPath);
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, html);
  }
}

function routePayload(content: ContentManifest, route: RouteEntry) {
  return {
    route,
    post: route.params?.abbrlink ? content.posts.find((post) => post.abbrlink === route.params?.abbrlink) : undefined,
    page: route.kind === "page" ? content.pages.find((page) => page.route === route.route) : undefined
  };
}

async function writePagePayload(route: RouteEntry, payload: unknown) {
  const payloadPath = path.join(distDir, "manifest/pages", `${route.outputPath}.json`);
  await fs.mkdir(path.dirname(payloadPath), { recursive: true });
  await fs.writeFile(payloadPath, JSON.stringify(payload));
}
