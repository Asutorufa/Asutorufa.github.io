import type { ContentManifest, Page, Post } from "../types/content";
import type { PagePayload } from "./app-types";

export function mergePagePayload(content: ContentManifest, payload: PagePayload): ContentManifest {
  const payloadPosts = new Map(payload.posts?.map((post) => [post.abbrlink, post]));
  return {
    ...content,
    posts: content.posts.map((post) => payloadPosts.get(post.abbrlink) ?? (payload.post?.abbrlink === post.abbrlink ? payload.post : stripPostBody(post))),
    pages: content.pages.map((page) => (payload.page?.route === page.route ? payload.page : stripPageBody(page)))
  };
}

function stripPostBody(post: Post): Post {
  return {
    ...post,
    bodyMarkdown: "",
    bodyHtml: "",
    rawMarkdown: "",
    plainText: "",
    excerptMarkdown: "",
    excerptHtml: "",
    toc: []
  };
}

function stripPageBody(page: Page): Page {
  return {
    ...page,
    bodyMarkdown: "",
    bodyHtml: "",
    rawMarkdown: "",
    plainText: ""
  };
}
