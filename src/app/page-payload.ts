import type { ContentManifest, Post, ThreatReport } from "../types/content";
import type { CommonContent, PagePayload } from "./app-types";

export function mergePagePayload(content: CommonContent, payload: PagePayload): ContentManifest {
  const routeIsWip = payload.route.kind === "wip" || payload.route.kind === "wip-post";
  const routePosts = payload.posts ?? articlePosts(payload);
  const routeThreatReports = uniqueThreatReports([
    ...articleThreatReports(payload),
    ...(payload.threatReports ?? []),
    ...(payload.threatReportTranslations ?? [])
  ]);
  return {
    ...content,
    currentList: payload.posts
      ? {
          totalPages: payload.totalPages ?? 1,
          totalPosts: payload.totalPosts ?? payload.posts.length
        }
      : undefined,
    currentThreatList: payload.threatReports
      ? {
          totalPages: payload.totalThreatPages ?? 1,
          totalReports: payload.totalThreatReports ?? payload.threatReports.length
        }
      : undefined,
    currentThreatLanguages: payload.availableThreatLanguages,
    posts: routeIsWip ? [] : routePosts,
    wipPosts: routeIsWip ? routePosts : [],
    pages: payload.page ? [payload.page] : [],
    threatReports: routeThreatReports,
    tags: payload.tags ?? [],
    categories: payload.categories ?? [],
    archives: payload.archives ?? []
  };
}

function articlePosts(payload: PagePayload): Post[] {
  return [payload.newerPost, payload.post, payload.olderPost].filter((post) => post !== undefined);
}

function articleThreatReports(payload: PagePayload): ThreatReport[] {
  return [payload.previousThreatReport, payload.threatReport, payload.nextThreatReport].filter((report): report is ThreatReport => report !== undefined);
}

function uniqueThreatReports(reports: ThreatReport[]) {
  const seen = new Set<string>();
  return reports.filter((report) => {
    const key = `${report.id}:${report.language}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
