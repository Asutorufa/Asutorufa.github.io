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
  await fs.writeFile(path.join(distDir, "manifest/content.json"), JSON.stringify(content, null, 2));
  await fs.writeFile(path.join(distDir, "manifest/routes.json"), JSON.stringify(routes, null, 2));

  for (const route of routes) {
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
