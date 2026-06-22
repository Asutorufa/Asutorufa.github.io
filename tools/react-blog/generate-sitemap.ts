import fs from "node:fs/promises";
import path from "node:path";
import type { ContentManifest, RouteEntry } from "../../src/types/content";
import { formatDate, parseLooseDate } from "./content-utils";
import { distDir } from "./paths";

export async function generateSitemap(content: ContentManifest, routes: RouteEntry[]) {
  const urls = routes
    .filter((route) => route.kind !== "not-found")
    .map((route) => sitemapEntry(content, route))
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  await fs.writeFile(path.join(distDir, "sitemap.xml"), xml);
}

function sitemapEntry(content: ContentManifest, route: RouteEntry) {
  const loc = new URL(sitemapRoute(route), content.config.url).toString();
  const lastmod = routeLastmod(content, route);

  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
}

function sitemapRoute(route: RouteEntry) {
  if (route.kind === "page" || route.kind === "tags" || route.kind === "categories" || route.kind === "archives") {
    return `${route.route.replace(/\/$/, "")}/index.html`;
  }
  return route.route;
}

function routeLastmod(content: ContentManifest, route: RouteEntry) {
  if (route.kind === "post" && route.params?.abbrlink) {
    const post = content.posts.find((item) => item.abbrlink === route.params?.abbrlink);
    return formatDate(post?.updated || post?.date);
  }

  if (route.kind === "page") {
    const page = content.pages.find((item) => item.route === route.route);
    return formatDate(page?.updated || page?.date) || latestPostDate(content);
  }

  if ((route.kind === "tag" || route.kind === "tag-page") && route.params?.tag) {
    return latestPostDate(content, (post) => post.tags.includes(route.params?.tag ?? ""));
  }

  if ((route.kind === "category" || route.kind === "category-page") && route.params?.category) {
    return latestPostDate(content, (post) => post.categories.includes(route.params?.category ?? ""));
  }

  if ((route.kind === "archive-year" || route.kind === "archive-year-page") && route.params?.year) {
    const prefix = route.params.month ? `${route.params.year}-${route.params.month}` : route.params.year;
    return latestPostDate(content, (post) => post.date.startsWith(prefix));
  }

  if (route.kind === "archive-month" || route.kind === "archive-month-page") {
    const prefix = route.params?.year && route.params?.month ? `${route.params.year}-${route.params.month}` : "";
    return latestPostDate(content, (post) => post.date.startsWith(prefix));
  }

  return latestPostDate(content);
}

function latestPostDate(content: ContentManifest, filter?: (post: ContentManifest["posts"][number]) => boolean) {
  const posts = filter ? content.posts.filter(filter) : content.posts;
  const latest = posts.reduce<string | undefined>((result, post) => {
    const candidate = post.updated || post.date;
    if (!result) return candidate;
    const resultTime = parseLooseDate(result)?.getTime() ?? 0;
    const candidateTime = parseLooseDate(candidate)?.getTime() ?? 0;
    return candidateTime > resultTime ? candidate : result;
  }, undefined);
  return formatDate(latest);
}

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
