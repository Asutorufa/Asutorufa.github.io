import path from "node:path";
import { DEFAULT_LANGUAGE } from "../../src/data/i18n";
import type { ContentManifest, Post, RouteEntry } from "../../src/types/content";

export function buildRoutes(content: ContentManifest): RouteEntry[] {
  const routes: RouteEntry[] = [];
  const totalPages = Math.max(1, Math.ceil(content.posts.length / content.config.perPage));

  for (let page = 1; page <= totalPages; page += 1) {
    routes.push({
      route: page === 1 ? "/" : `/page/${page}/`,
      outputPath: page === 1 ? "index.html" : `page/${page}/index.html`,
      kind: "home",
      title: page === 1 ? content.config.title : `${content.config.title} - Page ${page}`,
      language: DEFAULT_LANGUAGE,
      params: { page: String(page) }
    });
  }

  for (const post of content.posts) {
    routes.push({
      route: post.route,
      outputPath: routeToOutputPath(post.route),
      kind: "post",
      title: post.title,
      language: post.language,
      params: { abbrlink: post.abbrlink }
    });
  }

  for (const page of content.pages.filter((item) => !["/archives/", "/tags/", "/categories/"].includes(item.route))) {
    routes.push({
      route: page.route,
      outputPath: routeToOutputPath(page.route),
      kind: "page",
      title: page.title,
      language: page.language
    });
  }

  routes.push({
    route: "/archives/",
    outputPath: "archives/index.html",
    kind: "archives",
    title: "Archives",
    language: DEFAULT_LANGUAGE
  });

  for (let page = 2; page <= Math.ceil(content.posts.length / content.config.perPage); page += 1) {
    routes.push({
      route: `/archives/page/${page}/`,
      outputPath: routeToOutputPath(`/archives/page/${page}/`),
      kind: "archives-page",
      title: `Archives - Page ${page}`,
      language: DEFAULT_LANGUAGE,
      params: { page: String(page) }
    });
  }

  for (const archive of content.archives) {
    const postsInYear = content.posts.filter((post) => post.date.startsWith(archive.year));
    routes.push({
      route: archive.route,
      outputPath: routeToOutputPath(archive.route),
      kind: "archive-year",
      title: `Archives: ${archive.year}`,
      language: DEFAULT_LANGUAGE,
      params: { year: archive.year }
    });

    for (let page = 2; page <= Math.ceil(postsInYear.length / content.config.perPage); page += 1) {
      routes.push({
        route: `/archives/${archive.year}/page/${page}/`,
        outputPath: routeToOutputPath(`/archives/${archive.year}/page/${page}/`),
        kind: "archive-year-page",
        title: `Archives: ${archive.year} - Page ${page}`,
        language: DEFAULT_LANGUAGE,
        params: { year: archive.year, page: String(page) }
      });
    }
  }

  for (const month of collectArchiveMonths(content.posts)) {
    const postsInMonth = content.posts.filter((post) => post.date.startsWith(`${month.year}-${month.month}`));
    routes.push({
      route: `/archives/${month.year}/${month.month}/`,
      outputPath: routeToOutputPath(`/archives/${month.year}/${month.month}/`),
      kind: "archive-month",
      title: `Archives: ${month.year}/${month.month}`,
      language: DEFAULT_LANGUAGE,
      params: { year: month.year, month: month.month }
    });

    for (let page = 2; page <= Math.ceil(postsInMonth.length / content.config.perPage); page += 1) {
      routes.push({
        route: `/archives/${month.year}/${month.month}/page/${page}/`,
        outputPath: routeToOutputPath(`/archives/${month.year}/${month.month}/page/${page}/`),
        kind: "archive-month-page",
        title: `Archives: ${month.year}/${month.month} - Page ${page}`,
        language: DEFAULT_LANGUAGE,
        params: { year: month.year, month: month.month, page: String(page) }
      });
    }
  }

  routes.push({
    route: "/tags/",
    outputPath: "tags/index.html",
    kind: "tags",
    title: "Tags",
    language: DEFAULT_LANGUAGE
  });

  for (const tag of content.tags) {
    const tagPosts = content.posts.filter((post) => post.tags.includes(tag.name));
    routes.push({
      route: tag.route,
      outputPath: routeToOutputPath(tag.route),
      kind: "tag",
      title: `Tag: ${tag.name}`,
      language: DEFAULT_LANGUAGE,
      params: { tag: tag.name }
    });

    for (let page = 2; page <= Math.ceil(tagPosts.length / content.config.perPage); page += 1) {
      routes.push({
        route: `${tag.route}page/${page}/`,
        outputPath: routeToOutputPath(`${tag.route}page/${page}/`),
        kind: "tag-page",
        title: `Tag: ${tag.name} - Page ${page}`,
        language: DEFAULT_LANGUAGE,
        params: { tag: tag.name, page: String(page) }
      });
    }
  }

  routes.push({
    route: "/categories/",
    outputPath: "categories/index.html",
    kind: "categories",
    title: "Categories",
    language: DEFAULT_LANGUAGE
  });

  for (const category of content.categories) {
    const categoryPosts = content.posts.filter((post) => post.categories.includes(category.name));
    routes.push({
      route: category.route,
      outputPath: routeToOutputPath(category.route),
      kind: "category",
      title: `Category: ${category.name}`,
      language: DEFAULT_LANGUAGE,
      params: { category: category.name }
    });

    for (let page = 2; page <= Math.ceil(categoryPosts.length / content.config.perPage); page += 1) {
      routes.push({
        route: `${category.route}page/${page}/`,
        outputPath: routeToOutputPath(`${category.route}page/${page}/`),
        kind: "category-page",
        title: `Category: ${category.name} - Page ${page}`,
        language: DEFAULT_LANGUAGE,
        params: { category: category.name, page: String(page) }
      });
    }
  }

  routes.push({
    route: "/404.html",
    outputPath: "404.html",
    kind: "not-found",
    title: "404",
    language: DEFAULT_LANGUAGE
  });

  return dedupeRoutes(routes);
}

function collectArchiveMonths(posts: Post[]) {
  const seen = new Set<string>();
  for (const post of posts) {
    const match = /^(\d{4})-(\d{2})/.exec(post.date);
    if (!match) continue;
    seen.add(`${match[1]}-${match[2]}`);
  }
  return [...seen]
    .sort()
    .map((value) => {
      const [year, month] = value.split("-");
      return { year, month };
    });
}

export function routeToOutputPath(route: string) {
  if (route === "/") return "index.html";
  if (route.endsWith(".html")) return route.replace(/^\//, "");
  return path.posix.join(route.replace(/^\//, ""), "index.html");
}

function dedupeRoutes(routes: RouteEntry[]) {
  const seen = new Set<string>();
  const result: RouteEntry[] = [];
  for (const route of routes) {
    if (seen.has(route.outputPath)) continue;
    seen.add(route.outputPath);
    result.push(route);
  }
  return result;
}
