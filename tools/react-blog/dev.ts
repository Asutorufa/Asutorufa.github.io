import fs from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";
import { mergePagePayload } from "../../src/app/page-payload";
import type { ContentManifest, RouteEntry } from "../../src/types/content";
import { buildRoutes } from "./build-routes";
import { collectContent } from "./collect-content";
import { commonContentForClient, renderHtmlShell } from "./html";
import { rootDir, sourceDir } from "./paths";
import { routePayload } from "./render-html";

type RenderPageModule = {
  renderPage: (props: { content: ContentManifest; route: RouteEntry }) => string;
};

type DevState = {
  content: ContentManifest;
  routes: Map<string, RouteEntry>;
};

const DEV_ASSETS = {
  scripts: ["/@vite/client", "/src/app/entry-client.tsx"],
  styles: []
};
const CONTENT_RELOAD_DELAY_MS = 80;

async function main() {
  let state = await loadState();
  let refreshTimer: NodeJS.Timeout | undefined;
  let refreshPromise = Promise.resolve();

  const server = await createServer({
    appType: "custom",
    root: rootDir,
    publicDir: false,
    server: {
      host: "0.0.0.0",
      port: previewPort(),
      strictPort: false
    }
  });

  server.watcher.add([path.join(sourceDir, "**/*")]);

  const scheduleContentRefresh = (changedPath: string) => {
    if (!isContentPath(changedPath)) return;
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      refreshTimer = undefined;
      refreshPromise = refreshPromise
        .catch(() => undefined)
        .then(async () => {
          try {
            state = await loadState();
            server.ws.send({ type: "full-reload" });
            console.log(`[blog] content updated: ${path.relative(rootDir, changedPath)}`);
          } catch (error) {
            console.error("[blog] failed to refresh content", error);
          }
        });
    }, CONTENT_RELOAD_DELAY_MS);
  };

  server.watcher.on("add", scheduleContentRefresh);
  server.watcher.on("change", scheduleContentRefresh);
  server.watcher.on("unlink", scheduleContentRefresh);

  server.middlewares.use(async (request, response, next) => {
    if (!request.url) return next();

    const url = new URL(request.url, "http://dev.local");
    if (url.pathname === "/search.json") {
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.setHeader("Cache-Control", "no-cache");
      response.end(JSON.stringify(searchRecords(state.content)));
      return;
    }
    if (await serveSourceAsset(url.pathname, state.content, response)) return;
    if (looksLikeViteRequest(url.pathname)) return next();

    try {
      const route = findRoute(state.routes, url.pathname);
      if (!route) return next();

      const commonContent = commonContentForClient(state.content);
      const payload = routePayload(state.content, route, { commonContent, includeArticleBody: true });
      const embeddedPayload = routePayload(state.content, route, { commonContent, includeArticleBody: false });
      const module = (await server.ssrLoadModule("/src/app/render-page.tsx")) as RenderPageModule;
      const appHtml = module.renderPage({ content: mergePagePayload(commonContent, payload), route });
      const html = renderHtmlShell({
        appHtml,
        assets: DEV_ASSETS,
        content: state.content,
        pagePayload: embeddedPayload,
        route
      });
      const transformed = await server.transformIndexHtml(url.pathname, html);

      response.statusCode = route.kind === "not-found" ? 404 : 200;
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      response.end(transformed);
    } catch (error) {
      server.ssrFixStacktrace(error as Error);
      next(error);
    }
  });

  await server.listen();
  server.printUrls();
}

async function loadState(): Promise<DevState> {
  const content = await collectContent();
  return {
    content,
    routes: new Map(buildRoutes(content).map((route) => [normalizePathname(route.route), route]))
  };
}

function findRoute(routes: Map<string, RouteEntry>, pathname: string) {
  const normalized = normalizePathname(pathname);
  return routes.get(normalized) ?? routes.get("/404.html");
}

function normalizePathname(pathname: string) {
  if (pathname === "/") return "/";
  if (pathname === "/404.html") return pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function isContentPath(filePath: string) {
  return filePath === sourceDir || filePath.startsWith(`${sourceDir}${path.sep}`);
}

function looksLikeViteRequest(pathname: string) {
  return (
    pathname.startsWith("/@") ||
    pathname.startsWith("/src/") ||
    pathname.startsWith("/node_modules/") ||
    pathname.startsWith("/__vite") ||
    pathname === "/favicon.ico"
  );
}

async function serveSourceAsset(pathname: string, content: ContentManifest, response: import("node:http").ServerResponse) {
  const sourcePath = sourceAssetPath(pathname, content);
  if (!sourcePath) return false;

  try {
    const stat = await fs.stat(sourcePath);
    if (!stat.isFile()) return false;
    const data = await fs.readFile(sourcePath);
    response.statusCode = 200;
    response.setHeader("Content-Type", contentType(sourcePath));
    response.setHeader("Cache-Control", "no-cache");
    response.end(data);
    return true;
  } catch {
    return false;
  }
}

function sourceAssetPath(pathname: string, content: ContentManifest) {
  const decoded = safeDecode(pathname);
  if (!decoded) return undefined;

  if (decoded.startsWith("/images/")) return safeJoin(path.join(sourceDir, "images"), decoded.slice("/images/".length));
  if (decoded.startsWith("/js/")) return safeJoin(path.join(sourceDir, "js"), decoded.slice("/js/".length));
  if (decoded === "/ads.txt" || decoded === "/robots.txt" || decoded === "/favicon.ico") return path.join(sourceDir, decoded.slice(1));

  const post = [...content.posts, ...content.wipPosts].find((item) => decoded.startsWith(item.route));
  if (!post || !post.sourcePath.endsWith("/doc.md")) return undefined;
  const relativeAssetPath = decoded.slice(post.route.length);
  if (!relativeAssetPath) return undefined;
  return safeJoin(path.dirname(path.join(rootDir, post.sourcePath)), relativeAssetPath);
}

function safeJoin(base: string, relativePath: string) {
  const resolved = path.resolve(base, relativePath);
  const normalizedBase = path.resolve(base);
  if (resolved !== normalizedBase && !resolved.startsWith(`${normalizedBase}${path.sep}`)) return undefined;
  return resolved;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}

function contentType(filePath: string) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".ico":
      return "image/x-icon";
    case ".xml":
      return "application/xml; charset=utf-8";
    case ".txt":
      return "text/plain; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

function previewPort() {
  const value = Number(process.env.PORT ?? process.env.REACT_BLOG_PREVIEW_PORT ?? "4173");
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 4173;
}

function searchRecords(content: ContentManifest) {
  return content.posts.map((post) => ({
    title: post.title,
    url: post.route,
    language: post.language,
    tags: post.tags,
    categories: post.categories,
    content: post.plainText
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
