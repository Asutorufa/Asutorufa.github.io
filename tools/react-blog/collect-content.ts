import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import type { BlogConfig, ContentManifest, Post } from "../../src/types/content";
import { DEFAULT_LANGUAGE } from "../../src/data/i18n";
import { formatTaxonomyName, normalizeTaxonomyName } from "../../src/utils/route";
import { comparePostsByDateDesc, createPage, createPost, routeSegment } from "./content-utils";
import { parseFrontMatter } from "./front-matter";
import { postsDir, rootDir, sourceDir, toPosixPath } from "./paths";

const config: BlogConfig = {
  title: "Asutorufaのブログ",
  subtitle: "こんにちは",
  description: "",
  author: "Asutorufa",
  url: "https://asutorufa.com",
  perPage: 10
};

const pagePatterns = ["source/about/index.md", "source/email/index.md", "source/friends/index.md", "source/resume/index.md", "source/schedule/index.md"];

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
        return createPost(path.relative(rootDir, filePath), parseFrontMatter(raw), languageFallbacks);
      })
    )
  ).sort(comparePostsByDateDesc);

  applyTaxonomyDisplayNames(posts);
  assertUniquePostRoutes(posts);

  const pages = (
    await Promise.all(
      pagePatterns.map(async (relativePath) => {
        const filePath = path.join(rootDir, relativePath);
        try {
          const raw = await fs.readFile(filePath, "utf8");
          return createPage(relativePath, parseFrontMatter(raw), languageFallbacks);
        } catch {
          return null;
        }
      })
    )
  ).filter((page) => page !== null);

  const tags = collectTaxonomy(posts, "tags", "/tags");
  const categories = collectTaxonomy(posts, "categories", "/categories");
  const archives = collectArchives(posts);

  return {
    config,
    stats: {
      posts: posts.length,
      pages: pages.length,
      tags: tags.length,
      categories: categories.length,
      archives: archives.length
    },
    posts,
    pages,
    tags,
    categories,
    archives,
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

function applyTaxonomyDisplayNames(posts: Post[]) {
  const tags = collectTaxonomyDisplayNames(posts, "tags");
  const categories = collectTaxonomyDisplayNames(posts, "categories");

  for (const post of posts) {
    post.tags = applyTaxonomyDisplayName(post.tags, tags);
    post.categories = applyTaxonomyDisplayName(post.categories, categories);
  }
}

function collectTaxonomyDisplayNames(posts: Post[], key: "tags" | "categories") {
  const namesByKey = new Map<string, string[]>();

  for (const post of posts) {
    for (const name of post[key]) {
      const normalized = normalizeTaxonomyName(name);
      if (!normalized) continue;
      const names = namesByKey.get(normalized);
      if (names) {
        names.push(name);
      } else {
        namesByKey.set(normalized, [name]);
      }
    }
  }

  return new Map([...namesByKey].map(([normalized, names]) => [normalized, chooseTaxonomyDisplayName(normalized, names)]));
}

function applyTaxonomyDisplayName(names: string[], displayNames: Map<string, string>) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const name of names) {
    const normalized = normalizeTaxonomyName(name);
    const displayName = displayNames.get(normalized);
    if (!displayName || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(displayName);
  }

  return result;
}

function chooseTaxonomyDisplayName(normalized: string, names: string[]) {
  const fallback = formatTaxonomyName(normalized);
  const exactFallback = names.find((name) => name.trim() === fallback);
  if (exactFallback) return exactFallback.trim();

  const stylized = names.find((name) => isStylizedTaxonomyName(name));
  if (stylized) return stylized.trim();

  return fallback;
}

function isStylizedTaxonomyName(name: string) {
  return name
    .trim()
    .split(/[\s-]+/)
    .some((word) => /^[A-Z]{2,}$/.test(word) || /[A-Za-z][a-z]*[A-Z]/.test(word));
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
