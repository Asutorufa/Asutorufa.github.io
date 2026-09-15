import { LANGUAGE_META } from "../data/i18n";
import type { ContentManifest, RouteEntry } from "../types/content";
import { threatAlternateEntries } from "../utils/threats";

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
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonical);
  updateThreatAlternates(content, route);
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

function setMeta(attribute: "name" | "property", key: string, value: string) {
  document.querySelector(`meta[${attribute}="${key}"]`)?.setAttribute("content", value);
}
