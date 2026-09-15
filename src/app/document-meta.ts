import { LANGUAGE_META } from "../data/i18n";
import type { ContentManifest, RouteEntry } from "../types/content";
import { threatAlternateEntries, threatFeedRoute } from "../utils/threats";

export function updateDocumentMeta(content: ContentManifest, route: RouteEntry, descriptionOverride?: string) {
  const language = LANGUAGE_META[route.language];
  const title = route.title === content.config.title ? content.config.title : `${route.title} - ${content.config.title}`;
  const description = descriptionOverride ?? routeDescription(content, route);
  const canonical = new URL(route.route === "/404.html" ? "/" : route.route, content.config.url).toString();

  document.title = title;
  document.documentElement.lang = language.htmlLang;
  document.documentElement.dir = language.textDirection;
  setMeta("name", "description", description);
  setMeta("property", "og:title", route.title);
  setMeta("property", "og:url", canonical);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", language.locale);
  const threatReport =
    route.kind === "threat-report" ? content.threatReports.find((report) => report.id === route.params?.id && report.language === route.language) : undefined;
  setMeta("name", "keywords", threatReport ? threatKeywords(threatReport) : "program");
  setMeta("name", "twitter:card", threatReport ? "summary_large_image" : "summary");
  updateThreatOgMetadata(content, threatReport);
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonical);
  updateThreatAlternates(content, route);
  updateThreatFeedLink(content, route);
}

export function currentDocumentDescription() {
  if (typeof document === "undefined") return undefined;
  return document.querySelector('meta[name="description"]')?.getAttribute("content") ?? undefined;
}

function routeDescription(content: ContentManifest, route: RouteEntry) {
  if (route.kind === "post" && route.params?.abbrlink) {
    const post = content.posts.find((item) => item.abbrlink === route.params?.abbrlink);
    return post?.plainText.slice(0, 160) ?? content.config.subtitle;
  }
  if (route.kind === "wip-post" && route.params?.abbrlink) {
    const post = content.wipPosts.find((item) => item.abbrlink === route.params?.abbrlink);
    return post?.plainText.slice(0, 160) ?? content.config.subtitle;
  }
  if (route.kind === "threat-report" && route.params?.id) {
    const report = content.threatReports.find((item) => item.id === route.params?.id && item.language === route.language);
    return report?.summary || report?.plainText.slice(0, 160) || content.config.subtitle;
  }
  return content.config.description || content.config.subtitle;
}

function updateThreatAlternates(content: ContentManifest, route: RouteEntry) {
  document.querySelectorAll("link[data-threat-alternate]").forEach((element) => element.remove());
  const canonical = document.querySelector("link[rel=canonical]");
  for (const entry of threatAlternateEntries(content.threatReports, route)) {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = entry.hreflang;
    link.href = new URL(entry.route, content.config.url).toString();
    link.dataset.threatAlternate = "true";
    canonical?.after(link);
  }
}

function updateThreatFeedLink(content: ContentManifest, route: RouteEntry) {
  const link = document.querySelector<HTMLLinkElement>("link[data-threat-feed]");
  const threatRoute = route.kind === "threats" || route.kind === "threats-page" || route.kind === "threat-report";
  if (!threatRoute) {
    link?.remove();
    return;
  }

  if (link) {
    link.href = new URL(threatFeedRoute(route.language), content.config.url).toString();
    link.title = `${route.title} RSS`;
    return;
  }

  const next = document.createElement("link");
  next.rel = "alternate";
  next.href = new URL(threatFeedRoute(route.language), content.config.url).toString();
  next.title = `${route.title} RSS`;
  next.type = "application/rss+xml";
  next.dataset.threatFeed = "true";
  document.head.append(next);
}

function updateThreatOgMetadata(content: ContentManifest, report: ContentManifest["threatReports"][number] | undefined) {
  const image = report ? new URL(`${report.route}og.png`, content.config.url).toString() : undefined;
  setOptionalMeta("property", "og:image", image);
  setOptionalMeta("property", "og:image:width", image ? "1200" : undefined);
  setOptionalMeta("property", "og:image:height", image ? "630" : undefined);
  setOptionalMeta("name", "twitter:image", image);
}

function threatKeywords(report: ContentManifest["threatReports"][number]) {
  return [...new Set([...report.cves, ...report.tags].map((value) => value.trim()).filter(Boolean))].slice(0, 24).join(", ");
}

function setMeta(attribute: "name" | "property", key: string, value: string) {
  document.querySelector(`meta[${attribute}="${key}"]`)?.setAttribute("content", value);
}

function setOptionalMeta(attribute: "name" | "property", key: string, value: string | undefined) {
  const selector = `meta[${attribute}="${key}"]`;
  const existing = document.querySelector<HTMLMetaElement>(selector);
  if (!value) {
    existing?.remove();
    return;
  }
  const meta = existing ?? document.createElement("meta");
  meta.setAttribute(attribute, key);
  meta.content = value;
  if (!existing) document.head.append(meta);
}
