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
      await syncDirectory(from, to);
    } else {
      await fs.mkdir(path.dirname(to), { recursive: true });
      await copyFileIfChanged(from, to, stat);
    }
  } catch {
    await fs.rm(to, { recursive: true, force: true });
  }
}

async function syncDirectory(sourceDir: string, targetDir: string) {
  const sourceEntries = await fs.readdir(sourceDir, { withFileTypes: true });
  const sourceNames = new Set(sourceEntries.map((entry) => entry.name));
  const targetEntries = await readDirectoryEntries(targetDir);

  await fs.mkdir(targetDir, { recursive: true });
  await Promise.all(
    targetEntries.filter((entry) => !sourceNames.has(entry.name)).map((entry) => fs.rm(path.join(targetDir, entry.name), { recursive: true, force: true }))
  );

  await Promise.all(
    sourceEntries.map(async (entry) => {
      const sourcePath = path.join(sourceDir, entry.name);
      const targetPath = path.join(targetDir, entry.name);
      if (entry.isDirectory()) {
        await syncDirectory(sourcePath, targetPath);
      } else if (entry.isFile()) {
        await copyFileIfChanged(sourcePath, targetPath, await fs.stat(sourcePath));
      }
    })
  );
}

async function copyFileIfChanged(sourcePath: string, targetPath: string, sourceStat: Awaited<ReturnType<typeof fs.stat>>) {
  try {
    const targetStat = await fs.stat(targetPath);
    if (targetStat.size === sourceStat.size && Math.trunc(targetStat.mtimeMs) === Math.trunc(sourceStat.mtimeMs)) return;
  } catch {
    // Missing targets are copied below.
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourcePath, targetPath);
  await fs.utimes(targetPath, sourceStat.atime, sourceStat.mtime);
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
