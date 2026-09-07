import type { RouteEntry } from "../types/content";

export type RouteHistoryState = {
  background?: BackgroundRouteState;
  canGoBack?: boolean;
  route?: string;
  scroll?: ScrollPosition;
  scrollX?: number;
  scrollY?: number;
};

export type BackgroundRouteState = {
  route: string;
  scroll: ScrollPosition;
};

export type ScrollPosition = {
  x: number;
  y: number;
};

export function isListRoute(route: RouteEntry) {
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

export function shouldHandleLink(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const url = new URL(anchor.href);
  if (url.origin !== window.location.origin) return false;

  const path = decodeURI(url.pathname);
  if (path.startsWith("/assets/") || path.startsWith("/images/") || path.startsWith("/manifest/")) return false;
  if (/\.[a-z0-9]+$/i.test(path) && !path.endsWith("/index.html") && path !== "/404.html") return false;

  return true;
}

export function isDocumentScrollLocked() {
  return document.documentElement.dataset.scrollLocked === "true";
}

export function isArticleImagePreviewTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("img")?.closest("[data-article-body]"));
}

export function sameDocumentHash(url: URL) {
  if (!url.hash) return false;
  return url.pathname === window.location.pathname && url.search === window.location.search;
}

export function loadUrlDocument(url: URL) {
  const nextUrl = url.toString();
  if (nextUrl === window.location.href) {
    window.location.reload();
    return;
  }
  window.location.href = nextUrl;
}

export function normalizeRoutePath(pathname: string) {
  let value = decodeURI(pathname);
  if (value.endsWith("/index.html")) {
    value = value.slice(0, -"index.html".length);
  }
  if (!value.startsWith("/")) value = `/${value}`;
  if (value === "") value = "/";
  if (!value.endsWith("/") && !value.endsWith(".html")) value = `${value}/`;
  return value;
}

export function initialScrollPosition(): ScrollPosition {
  return { x: 0, y: 0 };
}

export function captureScrollPosition(): ScrollPosition {
  return {
    x: window.scrollX,
    y: window.scrollY
  };
}

export function scrollPositionFromState(state: RouteHistoryState): ScrollPosition {
  if (state.scroll) return state.scroll;
  return {
    x: state.scrollX ?? 0,
    y: state.scrollY ?? 0
  };
}

export function restoreRoutePosition(position: ScrollPosition, hash?: string) {
  if (hash && restoreHashPosition(hash)) return;
  instantScrollTo(position);
}

export function historyState(value: unknown): RouteHistoryState {
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
