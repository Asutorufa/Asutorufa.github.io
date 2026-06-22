import type { PagePayload } from "./app-types";

export const PAGE_PAYLOAD_SCRIPT_ID = "__ASUTORUFA_PAGE_PAYLOAD__";
export const ARTICLE_BODY_SELECTOR = "[data-article-body]";

export function readEmbeddedPagePayload(doc: Document = document): PagePayload {
  const script = doc.getElementById(PAGE_PAYLOAD_SCRIPT_ID);
  if (!script?.textContent) {
    throw new Error("Unable to find embedded page payload");
  }
  return hydratePayloadBody(JSON.parse(script.textContent) as PagePayload, doc);
}

export function parsePagePayloadHtml(html: string): PagePayload {
  return readEmbeddedPagePayload(new DOMParser().parseFromString(html, "text/html"));
}

function hydratePayloadBody(payload: PagePayload, doc: Document): PagePayload {
  const bodyHtml = doc.querySelector<HTMLElement>(ARTICLE_BODY_SELECTOR)?.innerHTML;
  if (bodyHtml === undefined) return payload;

  const post = payload.post && payload.post.bodyHtml === "" ? { ...payload.post, bodyHtml } : payload.post;
  const page = payload.page && payload.page.bodyHtml === "" ? { ...payload.page, bodyHtml } : payload.page;

  if (post === payload.post && page === payload.page) return payload;
  return { ...payload, post, page };
}
