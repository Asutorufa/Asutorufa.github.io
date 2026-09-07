import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Router } from "wouter";
import { ImagePreviewHost } from "../components/ImagePreviewHost";
import { BlogLayout } from "../components/BlogLayout";
import { UI_LABELS } from "../data/i18n";
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
import { currentDocumentDescription, updateDocumentMeta } from "./document-meta";
import {
  captureScrollPosition,
  historyState,
  initialScrollPosition,
  isArticleImagePreviewTarget,
  isDocumentScrollLocked,
  isListRoute,
  loadUrlDocument,
  normalizeRoutePath,
  restoreRoutePosition,
  sameDocumentHash,
  scrollPositionFromState,
  shouldHandleLink,
  type BackgroundRouteState,
  type RouteHistoryState,
  type ScrollPosition
} from "./navigation";
import { parsePagePayloadHtml } from "./page-payload-html";
import { mergePagePayload } from "./page-payload";

type ViewState = AppProps;
type RouteTransitionKind = "detail-forward" | "detail-back" | "detail-swap" | "route";

const pagePayloadCache = new Map<string, PagePayload | Promise<PagePayload>>();
const sharedPostBodyBlockCounts = new Map<string, number>();
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

  const activeView = detailView ?? baseView;

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

    const restoreAfterRender = (position: ScrollPosition, hash?: string, immediate = false, alreadyRestored = false) => {
      const run = ++restoreRun;
      suppressScrollSaveUntil = performance.now() + ROUTE_RESTORE_SUPPRESSION_MS;

      if (immediate) {
        if (!alreadyRestored) restoreRoutePosition(position, hash);
        window.requestAnimationFrame(() => {
          if (run !== restoreRun) return;
          suppressScrollSaveUntil = performance.now() + 120;
          saveCurrentScrollState(activeRouteRef.current.route, true);
        });
        return;
      }

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

    const commitViews = (
      nextBaseView: ViewState,
      nextDetailView: ViewState | null,
      options?: {
        restore?: { position: ScrollPosition; hash?: string };
        sharedPostRoute?: string;
        transition?: RouteTransitionKind;
      }
    ) => {
      baseViewRef.current = nextBaseView;
      detailViewRef.current = nextDetailView;
      activeContentRef.current = (nextDetailView ?? nextBaseView).content;
      activeRouteRef.current = (nextDetailView ?? nextBaseView).route;

      const update = () => {
        flushSync(() => {
          setBaseView(nextBaseView);
          setDetailView(nextDetailView);
          setRouteLoading(false);
        });
        if (options?.restore) {
          restoreRoutePosition(options.restore.position, options.restore.hash);
        }
      };

      runRouteViewTransition(options?.transition ?? "route", update, options?.sharedPostRoute);
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
        commitViews(nextBaseView, null, {
          restore: { position: scroll, hash: url.hash },
          sharedPostRoute: detailViewRef.current?.route.route,
          transition: "detail-back"
        });
        updateDocumentMeta(nextBaseView.content, nextBaseView.route);
        window.dispatchEvent(new Event("asutorufa-route-change"));
        restoreAfterRender(scroll, url.hash, true, true);
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

          commitViews(nextBaseView, loaded.view, {
            restore: options.mode === "push" ? { position: nextScroll, hash: url.hash } : undefined,
            sharedPostRoute: options.mode === "push" ? loaded.view.route.route : undefined,
            transition: options.mode === "push" ? "detail-forward" : "detail-swap"
          });
          updateDocumentMeta(loaded.view.content, loaded.view.route, loaded.description);
          window.dispatchEvent(new Event("asutorufa-route-change"));
          restoreAfterRender(nextScroll, url.hash, options.mode === "push", options.mode === "push");
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

        commitViews(loaded.view, null, {
          restore: options.mode === "push" ? { position: nextScroll, hash: url.hash } : undefined,
          transition: "route"
        });
        updateDocumentMeta(loaded.view.content, loaded.view.route, loaded.description);
        window.dispatchEvent(new Event("asutorufa-route-change"));

        restoreAfterRender(nextScroll, url.hash, options.mode === "push", options.mode === "push");
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
          {renderRoute(activeView)}
        </BlogLayout>
      </Router>
      <ImagePreviewHost />
    </>
  );
}

function runRouteViewTransition(kind: RouteTransitionKind, update: () => void, sharedPostRoute?: string) {
  if (typeof document === "undefined" || !("startViewTransition" in document)) {
    update();
    return;
  }

  const root = document.documentElement;
  root.dataset.routeTransition = kind;
  const oldSharedElement = sharedPostRoute ? findPostTransitionElement(sharedPostRoute) : null;
  const oldBodyBlocks = sharedPostRoute ? findPostBodyTransitionBlocks(sharedPostRoute) : [];
  const sharedBlockCount =
    sharedPostRoute && kind === "detail-back" ? Math.min(sharedPostBodyBlockCounts.get(sharedPostRoute) ?? 0, oldBodyBlocks.length) : oldBodyBlocks.length;
  const oldSharedBodyBlocks = oldBodyBlocks.slice(0, sharedBlockCount);
  if (sharedPostRoute && kind === "detail-forward") sharedPostBodyBlockCounts.set(sharedPostRoute, sharedBlockCount);
  if (oldSharedElement) oldSharedElement.style.viewTransitionName = "active-post-header";
  setPostBodyTransitionNames(oldSharedBodyBlocks);

  const transition = document.startViewTransition(() => {
    update();
    const newSharedElement = sharedPostRoute ? findPostTransitionElement(sharedPostRoute) : null;
    if (newSharedElement) newSharedElement.style.viewTransitionName = "active-post-header";
    const newSharedBodyBlocks = sharedPostRoute ? findPostBodyTransitionBlocks(sharedPostRoute) : [];
    setPostBodyTransitionNames(newSharedBodyBlocks.slice(0, oldSharedBodyBlocks.length));
    const newBodyElement = sharedPostRoute ? findPostBodyTransitionElement(sharedPostRoute) : null;
    if (newBodyElement) newBodyElement.dataset.postBodyTransitionActive = kind;
  });

  void transition.finished.finally(() => {
    for (const element of document.querySelectorAll<HTMLElement>('[style*="view-transition-name"]')) {
      if (element.style.viewTransitionName === "active-post-header" || element.style.viewTransitionName.startsWith("active-post-body-")) {
        element.style.removeProperty("view-transition-name");
      }
    }
    for (const element of document.querySelectorAll<HTMLElement>("[data-post-body-transition-active]")) {
      delete element.dataset.postBodyTransitionActive;
    }
    if (sharedPostRoute && kind === "detail-back") sharedPostBodyBlockCounts.delete(sharedPostRoute);
    if (root.dataset.routeTransition === kind) delete root.dataset.routeTransition;
  });
}

function findPostTransitionElement(route: string) {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-post-transition]")).find((element) => element.dataset.postTransition === route) ?? null;
}

function findPostBodyTransitionElement(route: string) {
  return (
    Array.from(document.querySelectorAll<HTMLElement>("[data-post-body-transition]")).find(
      (element) => element.dataset.postBodyTransition === route
    ) ?? null
  );
}

function findPostBodyTransitionBlocks(route: string) {
  const body = findPostBodyTransitionElement(route);
  if (!body) return [];
  const articleContent = body.querySelector<HTMLElement>(".article-content");
  return articleContent ? Array.from(articleContent.children).filter((element): element is HTMLElement => element instanceof HTMLElement) : [];
}

function setPostBodyTransitionNames(elements: HTMLElement[]) {
  elements.forEach((element, index) => {
    element.style.viewTransitionName = `active-post-body-${index}`;
  });
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

