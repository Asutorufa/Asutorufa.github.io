import fs from "node:fs/promises";
import path from "node:path";
import type { ContentManifest, Post } from "../../src/types/content";
import { distDir, fromRoot, rootDir } from "./paths";
import { buildConcurrency, mapConcurrent } from "./concurrency";

const copies = [
  ["source/images", "images"],
  ["source/js", "js"],
  ["source/ads.txt", "ads.txt"],
  ["source/robots.txt", "robots.txt"],
  ["source/favicon.ico", "favicon.ico"]
] as const;

export async function copyStaticAssets(content?: ContentManifest) {
  const concurrency = buildConcurrency();
  await mapConcurrent(copies, concurrency, async ([from, to]) => copyIfExists(fromRoot(from), path.join(distDir, to)));
  if (content) await copyPostAssets([...content.posts, ...content.wipPosts], concurrency);
}

async function copyIfExists(from: string, to: string) {
  try {
    const stat = await fs.stat(from);
    if (stat.isDirectory()) {
      await fs.cp(from, to, { recursive: true });
    } else {
      await fs.mkdir(path.dirname(to), { recursive: true });
      await fs.copyFile(from, to);
    }
  } catch {
    // Optional legacy assets are skipped when absent.
  }
}

async function copyPostAssets(posts: Post[], concurrency: number) {
  await mapConcurrent(posts, concurrency, async (post) => {
    if (!post.sourcePath.endsWith("/doc.md")) return;

    const sourceDir = path.dirname(path.join(rootDir, post.sourcePath));
    const targetDir = path.join(distDir, post.route.replace(/^\/|\/$/g, ""));
    await copyDirectoryAssets(sourceDir, targetDir);
  });
}

async function copyDirectoryAssets(sourceDir: string, targetDir: string, relativeDir = "") {
  const entries = await readDirectoryEntries(path.join(sourceDir, relativeDir));

  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);
    if (relativePath === "doc.md") continue;

    const sourcePath = path.join(sourceDir, relativePath);
    const targetPath = path.join(targetDir, relativePath);

    if (entry.isDirectory()) {
      await copyDirectoryAssets(sourceDir, targetDir, relativePath);
    } else if (entry.isFile()) {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

async function readDirectoryEntries(directory: string) {
  try {
    return await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
}
