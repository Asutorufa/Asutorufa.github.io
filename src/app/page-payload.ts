import type { ContentManifest, Post } from "../types/content";
import type { CommonContent, PagePayload } from "./app-types";

export function mergePagePayload(content: CommonContent, payload: PagePayload): ContentManifest {
  const routeIsWip = payload.route.kind === "wip" || payload.route.kind === "wip-post";
  const routePosts = payload.posts ?? articlePosts(payload);
  return {
    ...content,
    currentList: payload.posts
      ? {
          totalPages: payload.totalPages ?? 1,
          totalPosts: payload.totalPosts ?? payload.posts.length
        }
      : undefined,
    posts: routeIsWip ? [] : routePosts,
    wipPosts: routeIsWip ? routePosts : [],
    pages: payload.page ? [payload.page] : [],
    tags: payload.tags ?? [],
    categories: payload.categories ?? [],
    archives: payload.archives ?? []
  };
}

function articlePosts(payload: PagePayload): Post[] {
  return [payload.newerPost, payload.post, payload.olderPost].filter((post) => post !== undefined);
}
