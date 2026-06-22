import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Router } from "wouter";
import { BlogLayout } from "../components/BlogLayout";
import { LANGUAGE_META, UI_LABELS } from "../data/i18n";
import { ArchivePage } from "../pages/ArchivePage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PageView } from "../pages/PageView";
import { PostPage } from "../pages/PostPage";
import { TaxonomyPage } from "../pages/TaxonomyPage";
import { ToolsPage } from "../pages/ToolsPage";
import type { ContentManifest, RouteEntry } from "../types/content";
import type { AppProps, PagePayload } from "./app-types";
import { mergePagePayload } from "./page-payload";

type RouteHistoryState = {
  route?: string;
  scrollX?: number;
  scrollY?: number;
  canGoBack?: boolean;
};

type ScrollPosition = {
  scrollX: number;
  scrollY: number;
  anchorOffset?: number;
  anchorRoute?: string;
};

type RouteTransitionKind = "forward" | "back" | "post-open" | "post-close" | "post-swap";

const pagePayloadCache = new Map<string, PagePayload | Promise<PagePayload>>();
const scrollPositions = new Map<string, ScrollPosition>();
const ENABLE_ROUTE_SCROLL_RESTORE = true;

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
    if (ENABLE_ROUTE_SCROLL_RESTORE) rememberScrollPosition();

    let saveScrollFrame = 0;
    let suppressScrollSaveUntil = 0;

    function replaceRouteState(routePath: string) {
      window.history.replaceState({ ...historyState(window.history.state), route: routePath }, "", window.location.href);
    }

    function rememberScrollPosition(routePath = routeRef.current.route) {
      const anchor = currentScrollAnchor();
      const position = {
        ...anchor,
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
      if (!ENABLE_ROUTE_SCROLL_RESTORE) return;
      if (performance.now() < suppressScrollSaveUntil) return;
      window.cancelAnimationFrame(saveScrollFrame);
      saveScrollFrame = window.requestAnimationFrame(() => rememberScrollPosition());
    }

    const navigate = async (
      url: URL,
      options: {
        mode: "push" | "replace";
        saveCurrentScroll: boolean;
        restoreState?: RouteHistoryState;
        transitionOriginY?: number;
      }
    ) => {
      if (ENABLE_ROUTE_SCROLL_RESTORE && options.saveCurrentScroll) rememberScrollPosition();

      let payload: PagePayload;
      try {
        payload = await loadPagePayload(url);
      } catch {
        window.location.href = url.toString();
        return;
      }
      const nextContent = mergePagePayload(contentRef.current, payload);

      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      const restorePosition =
        ENABLE_ROUTE_SCROLL_RESTORE && options.restoreState ? scrollPositionForRoute(payload.route.route, options.restoreState) : { scrollX: 0, scrollY: 0 };
      const previousState = historyState(options.restoreState);
      const nextState = {
        ...previousState,
        route: payload.route.route,
        canGoBack: options.mode === "push" ? true : previousState.canGoBack
      };
      if (options.mode === "push") {
        window.history.pushState(nextState, "", nextUrl);
      } else {
        window.history.replaceState(nextState, "", nextUrl);
      }

      const commitRouteChange = (restoreBeforeSnapshot = false) => {
        contentRef.current = nextContent;
        routeRef.current = payload.route;
        flushSync(() => {
          setContent(nextContent);
          setRoute(payload.route);
        });
        updateDocumentMeta(nextContent, payload.route, payload.description);
        if (restoreBeforeSnapshot) {
          suppressScrollSaveUntil = performance.now() + 450;
          restoreRoutePosition(restorePosition, url.hash, options.transitionOriginY);
        }
        window.dispatchEvent(new Event("asutorufa-route-change"));
      };

      const transitionKind = routeTransitionKind(routeRef.current, payload.route, options.restoreState !== undefined);
      if (shouldAnimateRouteChange(url, routeRef.current, payload.route)) {
        const root = document.documentElement;
        root.dataset.routeTransition = transitionKind;
        const transition = document.startViewTransition(() => commitRouteChange(true));
        void transition.finished.finally(() => {
          if (root.dataset.routeTransition === transitionKind) {
            delete root.dataset.routeTransition;
          }
          rememberScrollPosition(payload.route.route);
        });
      } else {
        commitRouteChange();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            suppressScrollSaveUntil = performance.now() + 350;
            restoreRoutePosition(restorePosition, url.hash, options.transitionOriginY);
            rememberScrollPosition(payload.route.route);
          });
        });
      }
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || !shouldHandleLink(anchor)) return;

      const url = new URL(anchor.href);
      if (sameDocumentHash(url)) return;

      event.preventDefault();
      void navigate(url, { mode: "push", saveCurrentScroll: true, transitionOriginY: readMoreTransitionOriginY(anchor) });
    };

    const onPopState = (event: PopStateEvent) => {
      void navigate(new URL(window.location.href), {
        mode: "replace",
        saveCurrentScroll: false,
        restoreState: historyState(event.state)
      });
    };

    if (ENABLE_ROUTE_SCROLL_RESTORE) {
      window.addEventListener("scroll", scheduleScrollStateSave, { passive: true });
      window.addEventListener("resize", scheduleScrollStateSave);
    }
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.cancelAnimationFrame(saveScrollFrame);
      if (ENABLE_ROUTE_SCROLL_RESTORE) {
        window.removeEventListener("scroll", scheduleScrollStateSave);
        window.removeEventListener("resize", scheduleScrollStateSave);
      }
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
    case "tools":
      return <ToolsPage {...props} />;
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

function readMoreTransitionOriginY(anchor: HTMLAnchorElement) {
  if (!anchor.classList.contains("read-more-button")) return undefined;
  const rect = anchor.getBoundingClientRect();
  return rect.top + rect.height / 2;
}

function sameDocumentHash(url: URL) {
  if (!url.hash) return false;
  return url.pathname === window.location.pathname && url.search === window.location.search;
}

function shouldAnimateRouteChange(url: URL, currentRoute: RouteEntry, nextRoute: RouteEntry) {
  if (url.hash && currentRoute.route === nextRoute.route) return false;
  if (typeof document.startViewTransition !== "function") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return currentRoute.route !== nextRoute.route;
}

function routeTransitionKind(currentRoute: RouteEntry, nextRoute: RouteEntry, isHistoryNavigation: boolean): RouteTransitionKind {
  if (currentRoute.kind === "post" && nextRoute.kind === "post") return "post-swap";
  if (nextRoute.kind === "post") return "post-open";
  if (currentRoute.kind === "post") return "post-close";
  if (isHistoryNavigation) return "back";
  return "forward";
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
        const position = {
          anchorOffset: typeof parsed.anchorOffset === "number" ? parsed.anchorOffset : undefined,
          anchorRoute: typeof parsed.anchorRoute === "string" ? parsed.anchorRoute : undefined,
          scrollX: parsed.scrollX,
          scrollY: parsed.scrollY
        };
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

function restoreScrollPosition(position: ScrollPosition) {
  const anchor = position.anchorRoute ? scrollAnchorElement(position.anchorRoute) : undefined;
  const target = anchor
    ? {
        scrollX: position.scrollX,
        scrollY: window.scrollY + anchor.getBoundingClientRect().top - (position.anchorOffset ?? 0)
      }
    : position;
  instantScrollTo(target);

  if (anchor) {
    requestAnimationFrame(() => {
      instantScrollTo({
        scrollX: position.scrollX,
        scrollY: window.scrollY + anchor.getBoundingClientRect().top - (position.anchorOffset ?? 0)
      });
    });
  }
}

function restoreRoutePosition(position: ScrollPosition, hash?: string, transitionOriginY?: number) {
  if (hash && restoreHashPosition(hash, transitionOriginY)) {
    return;
  }
  restoreScrollPosition(position);
}

function restoreHashPosition(hash: string, transitionOriginY?: number) {
  const anchor = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!anchor) return false;

  if (typeof transitionOriginY === "number") {
    const targetTop = Math.max(72, Math.min(transitionOriginY, window.innerHeight - 96));
    instantScrollTo({
      scrollX: 0,
      scrollY: window.scrollY + anchor.getBoundingClientRect().top - targetTop
    });
  } else {
    anchor.scrollIntoView();
  }
  return true;
}

function instantScrollTo(position: ScrollPosition) {
  const maxScrollX = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
  const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const scrollX = Math.max(0, Math.min(position.scrollX, maxScrollX));
  const scrollY = Math.max(0, Math.min(position.scrollY, maxScrollY));

  if (Math.abs(window.scrollX - scrollX) < 2 && Math.abs(window.scrollY - scrollY) < 2) return;

  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo({ left: scrollX, top: scrollY, behavior: "auto" });
  window.requestAnimationFrame(() => {
    root.style.scrollBehavior = previousScrollBehavior;
  });
}

function currentScrollAnchor(): Pick<ScrollPosition, "anchorOffset" | "anchorRoute"> | undefined {
  let best:
    | {
        element: HTMLElement;
        score: number;
      }
    | undefined;

  for (const element of document.querySelectorAll<HTMLElement>("[data-scroll-route]")) {
    const rect = element.getBoundingClientRect();
    if (rect.top >= window.innerHeight) continue;

    const score = rect.bottom <= 0 ? Math.abs(rect.bottom) + 2000 : rect.top <= 80 ? Math.abs(rect.top) : rect.top + 1000;
    if (!best || score < best.score) best = { element, score };
  }

  const anchorRoute = best?.element.dataset.scrollRoute;
  if (!best || !anchorRoute) return undefined;

  return {
    anchorOffset: best.element.getBoundingClientRect().top,
    anchorRoute
  };
}

function scrollAnchorElement(anchorRoute: string) {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-route]")).find((element) => element.dataset.scrollRoute === anchorRoute);
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
    scrollY: typeof state.scrollY === "number" ? state.scrollY : undefined,
    canGoBack: state.canGoBack === true ? true : undefined
  };
}
