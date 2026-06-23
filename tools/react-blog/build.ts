import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { performance } from "node:perf_hooks";
import fg from "fast-glob";
import { createServer, type ViteDevServer } from "vite";
import type { AppProps } from "../../src/app/app-types";
import { buildRoutes } from "./build-routes";
import { collectContent } from "./collect-content";
import { copyStaticAssets } from "./copy-static";
import { generateFeed } from "./generate-feed";
import { generateSearch } from "./generate-search";
import { generateSitemap } from "./generate-sitemap";
import { writeClientCommonModule } from "./generate-client-common";
import { getMarkdownCacheStats } from "./content-utils";
import { getHtmlCacheStats, renderHtml, type PageRenderer } from "./render-html";
import { distDir, rootDir } from "./paths";

type RenderPageModule = {
  renderPage: (props: AppProps) => string;
};

type BuildTiming = {
  label: string;
  ms: number;
};

type BuildMode = "full" | "content-only";
type RequestedBuildMode = BuildMode | "auto";
type ClientFingerprint = {
  version: 1;
  hash: string;
  files: Array<{ path: string; hash: string }>;
};

const CLIENT_FINGERPRINT_PATH = path.join(distDir, ".vite/client-inputs.json");

async function build() {
  const timings: BuildTiming[] = [];
  const totalStart = performance.now();
  const requestedMode = buildMode();
  const clientFingerprint =
    requestedMode === "content-only" ? undefined : await timeStage(timings, "fingerprint client inputs", () => createClientFingerprint(timings));
  const canReuseClientAssets =
    requestedMode === "content-only" ||
    (clientFingerprint ? await timeStage(timings, "check client asset cache", () => hasReusableClientAssets(clientFingerprint)) : false);
  const mode: BuildMode = requestedMode === "full" || !canReuseClientAssets ? "full" : "content-only";

  if (mode === "content-only") {
    await timeStage(timings, "check reusable client assets", assertReusableClientAssets);
    await timeStage(timings, "clean content outputs", cleanContentOutputs);
  } else {
    await timeStage(timings, "clean dist", cleanDist);
  }
  const content = await timeStage(timings, "collect content", collectContent);
  const routes = await timeStage(timings, "build routes", () => buildRoutes(content));
  if (mode === "full") {
    await timeStage(timings, "write client common", () => writeClientCommonModule(content));
    await timeStage(timings, "build client assets", buildClientAssets);
    if (clientFingerprint) await timeStage(timings, "write client fingerprint", () => writeClientFingerprint(clientFingerprint));
  }

  let ssrServer: ViteDevServer | undefined;
  let ssrServerPromise: Promise<ViteDevServer> | undefined;
  let renderPagePromise: Promise<PageRenderer> | undefined;
  const loadRenderPage = () => {
    renderPagePromise ??= (async () => {
      ssrServerPromise ??= timeStage(timings, "create ssr server", createSsrServer);
      const server = await ssrServerPromise;
      ssrServer = server;
      const { renderPage } = await timeStage(timings, "load ssr renderer", () => server.ssrLoadModule("/src/app/render-page.tsx") as Promise<RenderPageModule>);
      return renderPage;
    })();
    return renderPagePromise;
  };

  try {
    await timeStage(timings, "render html", () => renderHtml(content, routes, loadRenderPage));
  } finally {
    const serverToClose = ssrServer;
    if (serverToClose) await timeStage(timings, "close ssr server", () => serverToClose.close());
  }

  await timeStage(timings, "postprocess", () =>
    Promise.all([
      timeStage(timings, "generate feed", () => generateFeed(content)),
      timeStage(timings, "generate sitemap", () => generateSitemap(content, routes)),
      timeStage(timings, "generate search", () => generateSearch(content)),
      timeStage(timings, "copy static assets", () => copyStaticAssets(content))
    ])
  );

  timings.push({ label: "total", ms: performance.now() - totalStart });
  await printReport(content, routes.length, timings, mode);
}

function buildMode(): RequestedBuildMode {
  if (process.argv.includes("--content-only") || process.env.REACT_BLOG_CONTENT_ONLY === "true") return "content-only";
  if (process.argv.includes("--full") || process.env.REACT_BLOG_FULL_BUILD === "true" || process.env.ANALYZE === "true") return "full";
  return "auto";
}

async function timeStage<T>(timings: BuildTiming[], label: string, task: () => T | Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    return await task();
  } finally {
    timings.push({ label, ms: performance.now() - start });
  }
}

async function cleanDist() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });
}

async function cleanContentOutputs() {
  await fs.mkdir(distDir, { recursive: true });
  const preserved = new Set([".vite", "assets", "stats.html"]);
  const entries = await fs.readdir(distDir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => !preserved.has(entry.name))
      .map((entry) =>
        fs.rm(`${distDir}/${entry.name}`, {
          force: true,
          recursive: true
        })
      )
  );
}

async function assertReusableClientAssets() {
  try {
    await fs.access(`${distDir}/.vite/manifest.json`);
    await fs.access(`${distDir}/assets`);
  } catch {
    throw new Error("Content-only build needs existing client assets. Run `npm run build` once, then retry `npm run build:content`.");
  }
}

async function hasReusableClientAssets(fingerprint: ClientFingerprint) {
  try {
    await assertReusableClientAssets();
    const cached = JSON.parse(await fs.readFile(CLIENT_FINGERPRINT_PATH, "utf8")) as Partial<ClientFingerprint>;
    return cached.version === 1 && cached.hash === fingerprint.hash;
  } catch {
    return false;
  }
}

async function writeClientFingerprint(fingerprint: ClientFingerprint) {
  await fs.mkdir(path.dirname(CLIENT_FINGERPRINT_PATH), { recursive: true });
  await fs.writeFile(CLIENT_FINGERPRINT_PATH, `${JSON.stringify(fingerprint, null, 2)}\n`);
}

async function createClientFingerprint(timings: BuildTiming[]): Promise<ClientFingerprint> {
  const files = await timeStage(timings, "find client input files", () =>
    fg(["index.html", "package.json", "package-lock.json", "tsconfig.json", "vite.config.mts", "src/**/*"], {
      absolute: false,
      cwd: rootDir,
      dot: true,
      ignore: ["src/generated/**"],
      onlyFiles: true
    })
  );
  const entries = await timeStage(timings, "read and hash client input files", () =>
    Promise.all(
      files.sort().map(async (filePath) => {
        const content = await fs.readFile(path.join(rootDir, filePath));
        return {
          path: filePath,
          hash: createHash("sha256").update(content).digest("hex")
        };
      })
    )
  );
  const digest = await timeStage(timings, "combine client input hashes", () => {
    const hash = createHash("sha256");
    for (const entry of entries) {
      hash.update(entry.path);
      hash.update("\0");
      hash.update(entry.hash);
      hash.update("\0");
    }
    return hash.digest("hex");
  });
  return {
    version: 1,
    hash: digest,
    files: entries
  };
}

async function buildClientAssets() {
  await run("npx", ["vite", "build"]);
}

async function createSsrServer(): Promise<ViteDevServer> {
  return createServer({
    appType: "custom",
    logLevel: "error",
    server: {
      hmr: false,
      middlewareMode: true,
      ws: false
    }
  });
}

async function run(command: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}

async function printReport(content: Awaited<ReturnType<typeof collectContent>>, routeCount: number, timings: BuildTiming[], mode: BuildMode) {
  console.log("React blog build complete");
  console.log(`mode: ${mode}`);
  console.log(`posts: ${content.posts.length}`);
  console.log(`wip posts: ${content.wipPosts.length}`);
  console.log(`pages: ${content.pages.length}`);
  console.log(`routes: ${routeCount}`);
  console.log(`tags: ${content.tags.length}`);
  console.log(`categories: ${content.categories.length}`);
  console.log(`archives: ${content.archives.length}`);
  console.log(`language fallbacks: ${content.languageFallbacks?.length ?? 0}`);
  const markdownCache = getMarkdownCacheStats();
  console.log(`markdown cache: ${markdownCache.hits} hits, ${markdownCache.misses} misses, ${markdownCache.writes} writes, ${markdownCache.errors} errors`);
  const htmlCache = getHtmlCacheStats();
  console.log(`html cache: ${htmlCache.hits} hits, ${htmlCache.misses} misses, ${htmlCache.writes} writes, ${htmlCache.errors} errors`);
  console.log("Build timings:");
  for (const timing of timings) {
    console.log(`  ${timing.label}: ${formatDuration(timing.ms)}`);
  }
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
