import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import { buildRoutes } from "./build-routes";
import { collectContent } from "./collect-content";
import { copyStaticAssets } from "./copy-static";
import { generateFeed } from "./generate-feed";
import { generateSearch } from "./generate-search";
import { generateSitemap } from "./generate-sitemap";
import { renderHtml } from "./render-html";
import { distDir } from "./paths";

async function build() {
  await cleanDist();
  const content = await collectContent();
  const routes = buildRoutes(content);
  await buildClientAssets();
  await renderHtml(content, routes);
  await generateFeed(content);
  await generateSitemap(content, routes);
  await generateSearch(content);
  await copyStaticAssets();
  await printReport(content, routes.length);
}

async function cleanDist() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });
}

async function buildClientAssets() {
  await run("npx", ["vite", "build"]);
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

async function printReport(content: Awaited<ReturnType<typeof collectContent>>, routeCount: number) {
  console.log("React blog build complete");
  console.log(`posts: ${content.posts.length}`);
  console.log(`pages: ${content.pages.length}`);
  console.log(`routes: ${routeCount}`);
  console.log(`tags: ${content.tags.length}`);
  console.log(`categories: ${content.categories.length}`);
  console.log(`archives: ${content.archives.length}`);
  console.log(`language fallbacks: ${content.languageFallbacks.length}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
