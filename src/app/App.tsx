import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Router } from "wouter";
import { ImagePreviewHost } from "../components/ImagePreviewHost";
import { BlogLayout } from "../components/BlogLayout";
import { LANGUAGE_META, UI_LABELS } from "../data/i18n";
import { ArchivePage } from "../pages/ArchivePage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PageView } from "../pages/PageView";
import { PostPage } from "../pages/PostPage";
import { TaxonomyPage } from "../pages/TaxonomyPage";
import { ToolsPage } from "../pages/ToolsPage";
import { WipPage } from "../pages/WipPage";
import type { ContentManifest, RouteEntry } from "../types/content";
import type { AppProps, PagePayload } from "./app-types";
import { parsePagePayloadHtml } from "./page-payload-html";
import { mergePagePayload } from "./page-payload";

type RouteHistoryState = {
  canGoBack?: boolean;
  route?: string;
  scroll?: ScrollPosition;
  scrollX?: number;
  scrollY?: number;
};

type ScrollPosition = {
  anchorOffset?: number;
  anchorRoute?: string;
  x: number;
  y: number;
};

const pagePayloadCache = new Map<string, PagePayload | Promise<PagePayload>>();
const ENABLE_ROUTE_SCROLL_RESTORE = true;
const ROUTE_RESTORE_DURATION_MS = 520;
const ROUTE_RESTORE_SUPPRESSION_MS = 720;
const SCROLL_STATE_WRITE_INTERVAL_MS = 850;

export function App(props: AppProps) {
  const [content, setContent] = useState(props.content);
  const [route, setRoute] = useState(props.route);
  const [routeLoading, setRouteLoading] = useState(false);
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

    let saveScrollFrame = 0;
    let saveScrollTimeout = 0;
    let lastScrollStateWrite = 0;
    let suppressScrollSaveUntil = 0;
    let restoreRun = 0;

    const replaceRouteState = (state: RouteHistoryState, url = window.location.href) => {
      try {
        window.history.replaceState(state, "", url);
        lastScrollStateWrite = performance.now();
        return true;
      } catch (error) {
        if (error instanceof DOMException && error.name === "SecurityError") {
          suppressScrollSaveUntil = performance.now() + SCROLL_STATE_WRITE_INTERVAL_MS * 2;
          return false;
        }
        throw error;
      }
    };

    const currentRouteState = (routePath = routeRef.current.route): RouteHistoryState => ({
      ...historyState(window.history.state),
      route: routePath
    });

    const saveCurrentScrollState = (routePath = routeRef.current.route, force = false) => {
      if (!ENABLE_ROUTE_SCROLL_RESTORE || isDocumentScrollLocked()) return;
      if (!force && performance.now() - lastScrollStateWrite < SCROLL_STATE_WRITE_INTERVAL_MS) return;

      const state = {
        ...currentRouteState(routePath),
        scroll: captureScrollPosition()
      };
      replaceRouteState(state);
    };

    const resetPendingScrollSave = () => {
      window.cancelAnimationFrame(saveScrollFrame);
      window.clearTimeout(saveScrollTimeout);
      saveScrollFrame = 0;
      saveScrollTimeout = 0;
    };

    const scheduleScrollStateSave = () => {
      if (!ENABLE_ROUTE_SCROLL_RESTORE) return;
      if (isDocumentScrollLocked()) return;
      if (performance.now() < suppressScrollSaveUntil) return;
      if (saveScrollFrame || saveScrollTimeout) return;

      const delay = Math.max(0, SCROLL_STATE_WRITE_INTERVAL_MS - (performance.now() - lastScrollStateWrite));
      const queueWrite = () => {
        saveScrollTimeout = 0;
        saveScrollFrame = window.requestAnimationFrame(() => {
          saveScrollFrame = 0;
          saveCurrentScrollState();
        });
      };

      if (delay > 0) {
        saveScrollTimeout = window.setTimeout(queueWrite, delay);
      } else {
        queueWrite();
      }
    };

    const restoreAfterRender = (position: ScrollPosition, hash?: string, transitionOriginY?: number) => {
      const run = ++restoreRun;
      const started = performance.now();
      suppressScrollSaveUntil = performance.now() + ROUTE_RESTORE_SUPPRESSION_MS;

      const restoreFrame = () => {
        if (run !== restoreRun) return;

        restoreRoutePosition(position, hash, transitionOriginY);
        if (performance.now() - started < ROUTE_RESTORE_DURATION_MS) {
          window.requestAnimationFrame(restoreFrame);
          return;
        }

        suppressScrollSaveUntil = performance.now() + 120;
        saveCurrentScrollState(routeRef.current.route, true);
      };

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(restoreFrame);
      });
    };

    const ensureInitialHistoryState = () => {
      const state = historyState(window.history.state);
      if (state.route === routeRef.current.route && state.scroll) return;
      replaceRouteState({
        ...state,
        route: routeRef.current.route,
        scroll: state.scroll ?? captureScrollPosition()
      });
    };

    ensureInitialHistoryState();

    const navigate = async (
      url: URL,
      options: {
        mode: "push" | "replace";
        restoreState?: RouteHistoryState;
        saveCurrentScroll: boolean;
        transitionOriginY?: number;
      }
    ) => {
      restoreRun += 1;
      resetPendingScrollSave();
      if (options.saveCurrentScroll) saveCurrentScrollState(routeRef.current.route, true);

      if (normalizeRoutePath(url.pathname) === routeRef.current.route && options.mode === "replace") {
        const state = historyState(options.restoreState ?? window.history.state);
        replaceRouteState({
          ...state,
          route: routeRef.current.route,
          scroll: scrollPositionFromState(state)
        });
        restoreAfterRender(scrollPositionFromState(state), url.hash, options.transitionOriginY);
        return;
      }

      setRouteLoading(true);

      try {
        const payload = await loadPagePayload(url);
        const nextContent = mergePagePayload(payload.commonContent ?? contentRef.current, payload);
        const nextUrl = `${url.pathname}${url.search}${url.hash}`;
        const previousState = historyState(options.restoreState ?? window.history.state);
        const nextState: RouteHistoryState = {
          ...previousState,
          canGoBack: options.mode === "push" ? true : previousState.canGoBack,
          route: payload.route.route,
          scroll: options.mode === "push" ? initialScrollPosition() : scrollPositionFromState(previousState)
        };

        if (options.mode === "push") {
          window.history.pushState(nextState, "", nextUrl);
        } else {
          replaceRouteState(nextState, nextUrl);
        }

        contentRef.current = nextContent;
        routeRef.current = payload.route;
        flushSync(() => {
          setContent(nextContent);
          setRoute(payload.route);
          setRouteLoading(false);
        });
        updateDocumentMeta(nextContent, payload.route, payload.description);
        window.dispatchEvent(new Event("asutorufa-route-change"));

        restoreAfterRender(nextState.scroll ?? initialScrollPosition(), url.hash, options.transitionOriginY);
      } catch (error) {
        console.error("Failed to navigate", error);
        setRouteLoading(false);
        loadUrlDocument(url);
      }
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (isArticleImagePreviewTarget(event.target)) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || !shouldHandleLink(anchor)) return;

      const url = new URL(anchor.href);
      if (sameDocumentHash(url)) return;

      event.preventDefault();
      void navigate(url, {
        mode: "push",
        saveCurrentScroll: true,
        transitionOriginY: readMoreTransitionOriginY(anchor)
      });
    };

    const onPopState = (event: PopStateEvent) => {
      void navigate(new URL(window.location.href), {
        mode: "replace",
        restoreState: historyState(event.state),
        saveCurrentScroll: false
      });
    };

    const onPageHide = () => {
      saveCurrentScrollState(routeRef.current.route, true);
    };

    if (ENABLE_ROUTE_SCROLL_RESTORE) {
      window.addEventListener("scroll", scheduleScrollStateSave, { passive: true });
      window.addEventListener("resize", scheduleScrollStateSave);
    }
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      resetPendingScrollSave();
      restoreRun += 1;
      if (ENABLE_ROUTE_SCROLL_RESTORE) {
        window.removeEventListener("scroll", scheduleScrollStateSave);
        window.removeEventListener("resize", scheduleScrollStateSave);
      }
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  return (
    <>
      <Router ssrPath={route.route}>
        <BlogLayout {...currentProps} routeLoading={routeLoading}>
          {renderRoute(currentProps)}
        </BlogLayout>
      </Router>
      <ImagePreviewHost />
    </>
  );
}

function renderRoute(props: AppProps) {
  const { route } = props;
  const labels = UI_LABELS[route.language];

  switch (route.kind) {
    case "home":
      return <HomePage {...props} page={Number(route.params?.page ?? "1")} />;
    case "post":
    case "wip-post":
      return <PostPage {...props} abbrlink={route.params?.abbrlink ?? ""} />;
    case "wip":
      return <WipPage {...props} />;
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

  const promise = fetch(routeHtmlUrl(routePath))
    .then((response) => {
      if (!response.ok) throw new Error(`Unable to load page payload: ${response.status}`);
      return response.text();
    })
    .then((html) => parsePagePayloadHtml(html))
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

function routeHtmlUrl(routePath: string) {
  if (routePath === "/") return "/";
  return routePath;
}

function payloadFromContent(content: ContentManifest, route: RouteEntry): PagePayload {
  const routePosts = route.kind === "wip" || route.kind === "wip-post" ? content.wipPosts : content.posts;
  return {
    route,
    commonContent: {
      config: content.config,
      stats: content.stats
    },
    description: currentDocumentDescription(),
    post: route.params?.abbrlink ? routePosts.find((post) => post.abbrlink === route.params?.abbrlink) : undefined,
    newerPost: route.params?.abbrlink ? adjacentPost(routePosts, route.params.abbrlink, -1) : undefined,
    olderPost: route.params?.abbrlink ? adjacentPost(routePosts, route.params.abbrlink, 1) : undefined,
    posts: isListRoute(route) ? routePosts : undefined,
    totalPages: isListRoute(route) ? content.currentList?.totalPages : undefined,
    totalPosts: isListRoute(route) ? content.currentList?.totalPosts : undefined,
    page: route.kind === "page" ? content.pages.find((page) => page.route === route.route) : undefined,
    tags: route.kind === "tags" ? content.tags : undefined,
    categories: route.kind === "categories" ? content.categories : undefined,
    archives: route.kind === "archives" ? content.archives : undefined
  };
}

function adjacentPost(posts: ContentManifest["posts"], abbrlink: string, offset: -1 | 1) {
  const index = posts.findIndex((post) => post.abbrlink === abbrlink);
  return index >= 0 ? posts[index + offset] : undefined;
}

function isListRoute(route: RouteEntry) {
  return (
    route.kind === "wip" ||
    route.kind === "home" ||
    route.kind === "archives" ||
    route.kind === "archive-year" ||
    route.kind === "archive-month" ||
    route.kind === "archives-page" ||
    route.kind === "archive-year-page" ||
    route.kind === "archive-month-page" ||
    route.kind === "tag" ||
    route.kind === "tag-page" ||
    route.kind === "category" ||
    route.kind === "category-page"
  );
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

function isDocumentScrollLocked() {
  return document.documentElement.dataset.scrollLocked === "true";
}

function isArticleImagePreviewTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("img")?.closest("[data-article-body]"));
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

function loadUrlDocument(url: URL) {
  const nextUrl = url.toString();
  if (nextUrl === window.location.href) {
    window.location.reload();
    return;
  }
  window.location.href = nextUrl;
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
  if (route.kind === "wip-post" && route.params?.abbrlink) {
    const post = content.wipPosts.find((item) => item.abbrlink === route.params?.abbrlink);
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

function initialScrollPosition(): ScrollPosition {
  return { x: 0, y: 0 };
}

function captureScrollPosition(): ScrollPosition {
  return {
    ...currentScrollAnchor(),
    x: window.scrollX,
    y: window.scrollY
  };
}

function scrollPositionFromState(state: RouteHistoryState): ScrollPosition {
  if (state.scroll) return state.scroll;
  return {
    x: state.scrollX ?? 0,
    y: state.scrollY ?? 0
  };
}

function restoreScrollPosition(position: ScrollPosition) {
  const anchor = position.anchorRoute ? scrollAnchorElement(position.anchorRoute) : undefined;
  const target = anchor
    ? {
        x: position.x,
        y: window.scrollY + anchor.getBoundingClientRect().top - (position.anchorOffset ?? 0)
      }
    : position;
  instantScrollTo(target);
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
      x: 0,
      y: window.scrollY + anchor.getBoundingClientRect().top - targetTop
    });
  } else {
    instantScrollTo({
      x: 0,
      y: window.scrollY + anchor.getBoundingClientRect().top
    });
  }
  return true;
}

function instantScrollTo(position: ScrollPosition) {
  const maxScrollX = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
  const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const scrollX = Math.max(0, Math.min(position.x, maxScrollX));
  const scrollY = Math.max(0, Math.min(position.y, maxScrollY));

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

function historyState(value: unknown): RouteHistoryState {
  if (!value || typeof value !== "object") return {};
  const state = value as RouteHistoryState;
  const scroll = scrollPositionValue(state.scroll);
  return {
    canGoBack: state.canGoBack === true ? true : undefined,
    route: typeof state.route === "string" ? state.route : undefined,
    scroll,
    scrollX: typeof state.scrollX === "number" ? state.scrollX : undefined,
    scrollY: typeof state.scrollY === "number" ? state.scrollY : undefined
  };
}

function scrollPositionValue(value: unknown): ScrollPosition | undefined {
  if (!value || typeof value !== "object") return undefined;
  const position = value as Partial<ScrollPosition>;
  if (typeof position.x !== "number" || typeof position.y !== "number") return undefined;

  return {
    anchorOffset: typeof position.anchorOffset === "number" ? position.anchorOffset : undefined,
    anchorRoute: typeof position.anchorRoute === "string" ? position.anchorRoute : undefined,
    x: position.x,
    y: position.y
  };
}
