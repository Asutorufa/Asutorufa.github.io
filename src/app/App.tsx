import { useEffect, useRef, useState } from "react";
import { Router } from "wouter";
import type { AppProps, PagePayload } from "./app-types";
import { BlogLayout } from "../components/BlogLayout";
import { LANGUAGE_META, UI_LABELS } from "../data/i18n";
import { ArchivePage } from "../pages/ArchivePage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PageView } from "../pages/PageView";
import { PostPage } from "../pages/PostPage";
import { TaxonomyPage } from "../pages/TaxonomyPage";
import type { ContentManifest, Page, Post, RouteEntry } from "../types/content";

type RouteHistoryState = {
  route?: string;
  scrollX?: number;
  scrollY?: number;
};

type ScrollPosition = {
  scrollX: number;
  scrollY: number;
};

const pagePayloadCache = new Map<string, PagePayload | Promise<PagePayload>>();
const scrollPositions = new Map<string, ScrollPosition>();

export function App(props: AppProps) {
  const [content, setContent] = useState(props.content);
  const [route, setRoute] = useState(props.route);
  const contentRef = useRef(content);
  const routeRef = useRef(route);
  const currentProps = { content, route };

  useEffect(() => {
    contentRef.current = content;
    routeRef.current = route;
    pagePayloadCache.set(route.route, payloadFromContent(content, route));
  }, [content, route]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.history.scrollRestoration = "manual";
    if (!historyState(window.history.state).route) {
      replaceRouteState(routeRef.current.route);
    }
    rememberScrollPosition();

    let saveScrollFrame = 0;

    function replaceRouteState(routePath: string) {
      window.history.replaceState({ ...historyState(window.history.state), route: routePath }, "", window.location.href);
    }

    function rememberScrollPosition(routePath = routeRef.current.route) {
      const position = {
        scrollX: window.scrollX,
        scrollY: window.scrollY
      };
      scrollPositions.set(routePath, position);
      try {
        sessionStorage.setItem(scrollStorageKey(routePath), JSON.stringify(position));
      } catch {
        // Ignore storage failures; the in-memory map still covers this tab.
      }
    }

    function scheduleScrollStateSave() {
      window.cancelAnimationFrame(saveScrollFrame);
      saveScrollFrame = window.requestAnimationFrame(() => rememberScrollPosition());
    }

    const navigate = async (
      url: URL,
      options: {
        mode: "push" | "replace";
        saveCurrentScroll: boolean;
        restoreState?: RouteHistoryState;
      }
    ) => {
      if (options.saveCurrentScroll) rememberScrollPosition();

      let payload: PagePayload;
      try {
        payload = await loadPagePayload(url);
      } catch {
        window.location.href = url.toString();
        return;
      }
      const nextContent = mergePagePayload(contentRef.current, payload);

      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      const restorePosition = options.restoreState ? scrollPositionForRoute(payload.route.route, options.restoreState) : { scrollX: 0, scrollY: 0 };
      const nextState = {
        ...historyState(options.restoreState),
        route: payload.route.route
      };
      if (options.mode === "push") {
        window.history.pushState(nextState, "", nextUrl);
      } else {
        window.history.replaceState(nextState, "", nextUrl);
      }

      contentRef.current = nextContent;
      routeRef.current = payload.route;
      setContent(nextContent);
      setRoute(payload.route);
      updateDocumentMeta(nextContent, payload.route, payload.description);
      window.dispatchEvent(new Event("asutorufa-route-change"));

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (url.hash) {
            document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();
            return;
          }
          window.scrollTo({
            left: restorePosition.scrollX,
            top: restorePosition.scrollY
          });
          scheduleScrollStateSave();
        });
      });
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || !shouldHandleLink(anchor)) return;

      const url = new URL(anchor.href);
      if (sameDocumentHash(url)) return;

      event.preventDefault();
      void navigate(url, { mode: "push", saveCurrentScroll: true });
    };

    const onPopState = (event: PopStateEvent) => {
      void navigate(new URL(window.location.href), {
        mode: "replace",
        saveCurrentScroll: false,
        restoreState: historyState(event.state)
      });
    };

    window.addEventListener("scroll", scheduleScrollStateSave, { passive: true });
    window.addEventListener("resize", scheduleScrollStateSave);
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.cancelAnimationFrame(saveScrollFrame);
      window.removeEventListener("scroll", scheduleScrollStateSave);
      window.removeEventListener("resize", scheduleScrollStateSave);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return (
    <Router ssrPath={route.route}>
      <BlogLayout {...currentProps}>{renderRoute(currentProps)}</BlogLayout>
    </Router>
  );
}

function renderRoute(props: AppProps) {
  const { route } = props;
  const labels = UI_LABELS[route.language];

  switch (route.kind) {
    case "home":
      return <HomePage {...props} page={Number(route.params?.page ?? "1")} />;
    case "post":
      return <PostPage {...props} abbrlink={route.params?.abbrlink ?? ""} />;
    case "page":
      return <PageView {...props} />;
    case "archives":
    case "archive-year":
    case "archive-month":
    case "archives-page":
    case "archive-year-page":
    case "archive-month-page":
      return <ArchivePage {...props} year={route.params?.year} month={route.params?.month} page={Number(route.params?.page ?? "1")} />;
    case "tags":
    case "tag":
    case "tag-page":
      return <TaxonomyPage {...props} type="tag" name={route.params?.tag} page={Number(route.params?.page ?? "1")} />;
    case "categories":
    case "category":
    case "category-page":
      return <TaxonomyPage {...props} type="category" name={route.params?.category} page={Number(route.params?.page ?? "1")} />;
    case "not-found":
      return <NotFoundPage labels={labels} />;
    default:
      return <NotFoundPage labels={labels} />;
  }
}

async function loadPagePayload(url: URL) {
  const routePath = normalizeRoutePath(url.pathname);
  const cached = pagePayloadCache.get(routePath);
  if (cached) return cached;

  const promise = fetch(routePayloadUrl(routePath))
    .then((response) => {
      if (!response.ok) throw new Error(`Unable to load page payload: ${response.status}`);
      return response.json() as Promise<PagePayload>;
    })
    .then((payload) => {
      pagePayloadCache.set(payload.route.route, payload);
      return payload;
    })
    .catch((error) => {
      pagePayloadCache.delete(routePath);
      throw error;
    });
  pagePayloadCache.set(routePath, promise);
  return promise;
}

function routePayloadUrl(routePath: string) {
  return `/manifest/pages/${routeOutputPath(routePath)}.json`;
}

function payloadFromContent(content: ContentManifest, route: RouteEntry): PagePayload {
  return {
    route,
    description: currentDocumentDescription(),
    post: route.params?.abbrlink ? content.posts.find((post) => post.abbrlink === route.params?.abbrlink) : undefined,
    posts: route.kind === "home" ? homeListPosts(content, route) : undefined,
    page: route.kind === "page" ? content.pages.find((page) => page.route === route.route) : undefined
  };
}

function homeListPosts(content: ContentManifest, route: RouteEntry) {
  const page = Number(route.params?.page ?? "1");
  const start = (page - 1) * content.config.perPage;
  return content.posts.slice(start, start + content.config.perPage);
}

function mergePagePayload(content: ContentManifest, payload: PagePayload): ContentManifest {
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

function shouldHandleLink(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const url = new URL(anchor.href);
  if (url.origin !== window.location.origin) return false;

  const path = decodeURI(url.pathname);
  if (path.startsWith("/assets/") || path.startsWith("/images/") || path.startsWith("/manifest/")) return false;
  if (/\.[a-z0-9]+$/i.test(path) && !path.endsWith("/index.html") && path !== "/404.html") return false;

  return true;
}

function sameDocumentHash(url: URL) {
  if (!url.hash) return false;
  return url.pathname === window.location.pathname && url.search === window.location.search;
}

function normalizeRoutePath(pathname: string) {
  let value = decodeURI(pathname);
  if (value.endsWith("/index.html")) {
    value = `${value.slice(0, -"index.html".length)}`;
  }
  if (!value.startsWith("/")) value = `/${value}`;
  if (value === "") value = "/";
  if (!value.endsWith("/") && !value.endsWith(".html")) value = `${value}/`;
  return value;
}

function routeOutputPath(routePath: string) {
  if (routePath === "/") return "index.html";
  if (routePath.endsWith(".html")) return routePath.replace(/^\//, "");
  return `${routePath.replace(/^\//, "")}index.html`;
}

function updateDocumentMeta(content: ContentManifest, route: AppProps["route"], descriptionOverride?: string) {
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
}

function routeDescription(content: ContentManifest, route: RouteEntry) {
  if (route.kind === "post" && route.params?.abbrlink) {
    const post = content.posts.find((item) => item.abbrlink === route.params?.abbrlink);
    return post?.plainText.slice(0, 160) ?? content.config.subtitle;
  }
  return content.config.description || content.config.subtitle;
}

function setMeta(attribute: "name" | "property", key: string, value: string) {
  document.querySelector(`meta[${attribute}="${key}"]`)?.setAttribute("content", value);
}

function currentDocumentDescription() {
  if (typeof document === "undefined") return undefined;
  return document.querySelector('meta[name="description"]')?.getAttribute("content") ?? undefined;
}

function scrollPositionForRoute(routePath: string, fallback?: RouteHistoryState): ScrollPosition {
  const cached = scrollPositions.get(routePath);
  if (cached) return cached;

  try {
    const stored = sessionStorage.getItem(scrollStorageKey(routePath));
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<ScrollPosition>;
      if (typeof parsed.scrollX === "number" && typeof parsed.scrollY === "number") {
        const position = { scrollX: parsed.scrollX, scrollY: parsed.scrollY };
        scrollPositions.set(routePath, position);
        return position;
      }
    }
  } catch {
    // Fall back to history state or top.
  }

  return {
    scrollX: fallback?.scrollX ?? 0,
    scrollY: fallback?.scrollY ?? 0
  };
}

function scrollStorageKey(routePath: string) {
  return `asutorufa-scroll:${routePath}`;
}

function historyState(value: unknown): RouteHistoryState {
  if (!value || typeof value !== "object") return {};
  const state = value as RouteHistoryState;
  return {
    route: typeof state.route === "string" ? state.route : undefined,
    scrollX: typeof state.scrollX === "number" ? state.scrollX : undefined,
    scrollY: typeof state.scrollY === "number" ? state.scrollY : undefined
  };
}
