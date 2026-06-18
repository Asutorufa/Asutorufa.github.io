import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import type { BlogConfig, ContentManifest, Post } from "../../src/types/content";
import { DEFAULT_LANGUAGE } from "../../src/data/i18n";
import { comparePostsByDateDesc, createPage, createPost, routeSegment } from "./content-utils";
import { postsDir, rootDir, sourceDir, toPosixPath } from "./paths";

const config: BlogConfig = {
  title: "Asutorufaのブログ",
  subtitle: "こんにちは",
  description: "",
  author: "Asutorufa",
  url: "https://asutorufa.com",
  perPage: 10
};

const pagePatterns = [
  "source/about/index.md",
  "source/email/index.md",
  "source/friends/index.md",
  "source/resume/index.md",
  "source/schedule/index.md"
];

export async function collectContent(): Promise<ContentManifest> {
  const languageFallbacks: Array<{ sourcePath: string; rawLanguage: string }> = [];
  const postFiles = await fg(["*.md", "*/doc.md"], {
    cwd: postsDir,
    absolute: true,
    onlyFiles: true
  });

  const posts = (
    await Promise.all(
      postFiles.map(async (filePath) => {
        const raw = await fs.readFile(filePath, "utf8");
        return createPost(path.relative(rootDir, filePath), matter(raw), languageFallbacks);
      })
    )
  ).sort(comparePostsByDateDesc);

  assertUniquePostRoutes(posts);

  const pages = (
    await Promise.all(
      pagePatterns.map(async (relativePath) => {
        const filePath = path.join(rootDir, relativePath);
        try {
          const raw = await fs.readFile(filePath, "utf8");
          return createPage(relativePath, matter(raw), languageFallbacks);
        } catch {
          return null;
        }
      })
    )
  ).filter((page) => page !== null);

  return {
    config,
    posts,
    pages,
    tags: collectTaxonomy(posts, "tags", "/tags"),
    categories: collectTaxonomy(posts, "categories", "/categories"),
    archives: collectArchives(posts),
    languageFallbacks
  };
}

export function siteDefaultLanguage() {
  return DEFAULT_LANGUAGE;
}

function collectTaxonomy(posts: Post[], key: "tags" | "categories", baseRoute: string) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const name of post[key]) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      route: `${baseRoute}/${routeSegment(name)}/`
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function collectArchives(posts: Post[]) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    if (!year) continue;
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([year, count]) => ({
      year,
      count,
      route: `/archives/${year}/`
    }))
    .sort((a, b) => b.year.localeCompare(a.year));
}

function assertUniquePostRoutes(posts: Post[]) {
  const seen = new Map<string, string>();
  for (const post of posts) {
    const previous = seen.get(post.route);
    if (previous) {
      throw new Error(`Duplicate post route ${post.route}: ${previous} and ${post.sourcePath}`);
    }
    seen.set(post.route, post.sourcePath);
  }
}

export function sourceRelativePath(filePath: string) {
  return toPosixPath(path.relative(sourceDir, filePath));
}
