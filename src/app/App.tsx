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
  background?: BackgroundRouteState;
  canGoBack?: boolean;
  route?: string;
  scroll?: ScrollPosition;
  scrollX?: number;
  scrollY?: number;
};

type BackgroundRouteState = {
  route: string;
  scroll: ScrollPosition;
};

type ScrollPosition = {
  x: number;
  y: number;
};

type ViewState = AppProps;

const pagePayloadCache = new Map<string, PagePayload | Promise<PagePayload>>();
const ENABLE_ROUTE_SCROLL_RESTORE = true;
const ROUTE_RESTORE_SUPPRESSION_MS = 720;
const SCROLL_STATE_WRITE_INTERVAL_MS = 850;

export function App(props: AppProps) {
  const initialView = { content: props.content, route: props.route };
  const [baseView, setBaseView] = useState<ViewState>(initialView);
  const [detailView, setDetailView] = useState<ViewState | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const baseViewRef = useRef<ViewState>(initialView);
  const detailViewRef = useRef<ViewState | null>(null);
  const activeContentRef = useRef(props.content);
  const activeRouteRef = useRef(props.route);

  const shouldShowDetailView = Boolean(detailView);
  const activeView = shouldShowDetailView && detailView ? detailView : baseView;

  useEffect(() => {
    baseViewRef.current = baseView;
    detailViewRef.current = detailView;
    activeContentRef.current = (detailView ?? baseView).content;
    activeRouteRef.current = (detailView ?? baseView).route;
    pagePayloadCache.set(baseView.route.route, payloadFromContent(baseView.content, baseView.route));
    if (detailView) {
      pagePayloadCache.set(detailView.route.route, payloadFromContent(detailView.content, detailView.route));
    }
  }, [baseView, detailView]);

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

    const currentRouteState = (routePath = activeRouteRef.current.route): RouteHistoryState => ({
      ...historyState(window.history.state),
      route: routePath
    });

    const saveCurrentScrollState = (routePath = activeRouteRef.current.route, force = false) => {
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

    const restoreAfterRender = (position: ScrollPosition, hash?: string) => {
      const run = ++restoreRun;
      suppressScrollSaveUntil = performance.now() + ROUTE_RESTORE_SUPPRESSION_MS;
      window.requestAnimationFrame(() => {
        if (run !== restoreRun) return;
        window.requestAnimationFrame(() => {
          if (run !== restoreRun) return;
          restoreRoutePosition(position, hash);
          suppressScrollSaveUntil = performance.now() + 120;
          saveCurrentScrollState(activeRouteRef.current.route, true);
        });
      });
    };

    const ensureInitialHistoryState = () => {
      const state = historyState(window.history.state);
      if (state.route === activeRouteRef.current.route && state.scroll && !state.background) return;
      replaceRouteState({
        ...state,
        background: undefined,
        route: activeRouteRef.current.route,
        scroll: state.scroll ?? captureScrollPosition()
      });
    };

    ensureInitialHistoryState();

    const commitViews = (nextBaseView: ViewState, nextDetailView: ViewState | null) => {
      baseViewRef.current = nextBaseView;
      detailViewRef.current = nextDetailView;
      activeContentRef.current = (nextDetailView ?? nextBaseView).content;
      activeRouteRef.current = (nextDetailView ?? nextBaseView).route;
      flushSync(() => {
        setBaseView(nextBaseView);
        setDetailView(nextDetailView);
        setRouteLoading(false);
      });
    };

    const loadView = async (url: URL) => {
      const payload = await loadPagePayload(url);
      return {
        description: payload.description,
        view: {
          content: mergePagePayload(payload.commonContent ?? activeContentRef.current, payload),
          route: payload.route
        }
      };
    };

    const loadBackgroundView = async (background: BackgroundRouteState) => {
      if (baseViewRef.current.route.route === background.route) return baseViewRef.current;
      return (await loadView(new URL(background.route, window.location.href))).view;
    };

    const navigate = async (
      url: URL,
      options: {
        background?: BackgroundRouteState;
        mode: "push" | "replace";
        restoreState?: RouteHistoryState;
        saveCurrentScroll: boolean;
      }
    ) => {
      restoreRun += 1;
      resetPendingScrollSave();
      if (options.saveCurrentScroll) saveCurrentScrollState(activeRouteRef.current.route, true);

      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      const nextRoutePath = normalizeRoutePath(url.pathname);
      const previousState = historyState(options.restoreState ?? window.history.state);
      const background = options.background ?? previousState.background;

      if (options.mode === "replace" && detailViewRef.current && !background && nextRoutePath === baseViewRef.current.route.route) {
        const scroll = scrollPositionFromState(previousState);
        const nextBaseView = baseViewRef.current;

        replaceRouteState(
          {
            ...previousState,
            background: undefined,
            route: nextBaseView.route.route,
            scroll
          },
          nextUrl
        );
        commitViews(nextBaseView, null);
        updateDocumentMeta(nextBaseView.content, nextBaseView.route);
        window.dispatchEvent(new Event("asutorufa-route-change"));
        restoreAfterRender(scroll, url.hash);
        return;
      }

      if (nextRoutePath === activeRouteRef.current.route && options.mode === "replace") {
        const scroll = scrollPositionFromState(previousState);
        replaceRouteState(
          {
            ...previousState,
            background,
            route: activeRouteRef.current.route,
            scroll
          },
          nextUrl
        );
        if (!background) {
          restoreAfterRender(scroll, url.hash);
        }
        return;
      }

      setRouteLoading(true);

      try {
        const loaded = await loadView(url);

        if (background) {
          const nextBaseView = await loadBackgroundView(background);
          const nextScroll = options.mode === "push" ? initialScrollPosition() : scrollPositionFromState(previousState);
          const nextState: RouteHistoryState = {
            ...previousState,
            background,
            canGoBack: options.mode === "push" ? true : previousState.canGoBack,
            route: loaded.view.route.route,
            scroll: nextScroll
          };

          if (options.mode === "push") {
            window.history.pushState(nextState, "", nextUrl);
          } else {
            replaceRouteState(nextState, nextUrl);
          }

          commitViews(nextBaseView, loaded.view);
          updateDocumentMeta(loaded.view.content, loaded.view.route, loaded.description);
          window.dispatchEvent(new Event("asutorufa-route-change"));
          restoreAfterRender(nextScroll, url.hash);
          return;
        }

        const nextScroll = options.mode === "push" ? initialScrollPosition() : scrollPositionFromState(previousState);
        const nextState: RouteHistoryState = {
          ...previousState,
          background: undefined,
          canGoBack: options.mode === "push" ? true : previousState.canGoBack,
          route: loaded.view.route.route,
          scroll: nextScroll
        };

        if (options.mode === "push") {
          window.history.pushState(nextState, "", nextUrl);
        } else {
          replaceRouteState(nextState, nextUrl);
        }

        commitViews(loaded.view, null);
        updateDocumentMeta(loaded.view.content, loaded.view.route, loaded.description);
        window.dispatchEvent(new Event("asutorufa-route-change"));

        restoreAfterRender(nextScroll, url.hash);
      } catch (error) {
        console.error("Failed to navigate", error);
        setRouteLoading(false);
        loadUrlDocument(url);
      }
    };

    const backgroundForArticleClick = (anchor: HTMLAnchorElement, url: URL): BackgroundRouteState | undefined => {
      const currentState = historyState(window.history.state);
      if (detailViewRef.current && currentState.background && anchor.closest("[data-background-post-link]")) {
        return currentState.background;
      }

      const baseRoute = baseViewRef.current.route;
      if (detailViewRef.current || !isListRoute(baseRoute)) return undefined;

      const targetRoute = normalizeRoutePath(url.pathname);
      const sourceRoute = anchor.closest<HTMLElement>("[data-scroll-route]")?.dataset.scrollRoute;
      if (!sourceRoute || normalizeRoutePath(sourceRoute) !== targetRoute) return undefined;

      return {
        route: baseRoute.route,
        scroll: captureScrollPosition()
      };
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (isArticleImagePreviewTarget(event.target)) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || !shouldHandleLink(anchor)) return;

      const url = new URL(anchor.href);
      if (sameDocumentHash(url)) return;
      const background = backgroundForArticleClick(anchor, url);

      event.preventDefault();
      void navigate(url, {
        background,
        mode: "push",
        saveCurrentScroll: true
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
      saveCurrentScrollState(activeRouteRef.current.route, true);
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
      <Router ssrPath={activeView.route.route}>
        <BlogLayout {...activeView} routeLoading={routeLoading}>
          <div className="relative">
            <div
              aria-hidden={shouldShowDetailView ? "true" : undefined}
              style={{
                inset: shouldShowDetailView ? 0 : undefined,
                pointerEvents: shouldShowDetailView ? "none" : undefined,
                position: shouldShowDetailView ? "absolute" : undefined,
                width: "100%",
                zIndex: 0
              }}
            >
              {renderRoute(baseView)}
            </div>
            {detailView ? (
              <div
                key={detailView.route.route}
                style={{
                  background: "var(--blog-bg)",
                  minHeight: "100vh",
                  position: "relative",
                  zIndex: 1
                }}
              >
                {renderRoute(detailView)}
              </div>
            ) : null}
          </div>
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
  instantScrollTo(position);
}

function restoreRoutePosition(position: ScrollPosition, hash?: string) {
  if (hash && restoreHashPosition(hash)) {
    return;
  }
  restoreScrollPosition(position);
}

function restoreHashPosition(hash: string) {
  const anchor = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!anchor) return false;

  instantScrollTo({
    x: 0,
    y: window.scrollY + anchor.getBoundingClientRect().top
  });
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

function historyState(value: unknown): RouteHistoryState {
  if (!value || typeof value !== "object") return {};
  const state = value as RouteHistoryState;
  const scroll = scrollPositionValue(state.scroll);
  return {
    background: backgroundRouteValue(state.background),
    canGoBack: state.canGoBack === true ? true : undefined,
    route: typeof state.route === "string" ? state.route : undefined,
    scroll,
    scrollX: typeof state.scrollX === "number" ? state.scrollX : undefined,
    scrollY: typeof state.scrollY === "number" ? state.scrollY : undefined
  };
}

function backgroundRouteValue(value: unknown): BackgroundRouteState | undefined {
  if (!value || typeof value !== "object") return undefined;
  const background = value as Partial<BackgroundRouteState>;
  const scroll = scrollPositionValue(background.scroll);
  if (typeof background.route !== "string" || !scroll) return undefined;
  return {
    route: background.route,
    scroll
  };
}

function scrollPositionValue(value: unknown): ScrollPosition | undefined {
  if (!value || typeof value !== "object") return undefined;
  const position = value as Partial<ScrollPosition>;
  if (typeof position.x !== "number" || typeof position.y !== "number") return undefined;

  return {
    x: position.x,
    y: position.y
  };
}
