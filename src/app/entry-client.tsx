import { hydrateRoot } from "react-dom/client";
import { App } from "./App";
import type { AppProps, CommonPayload } from "./app-types";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";
import "../styles/app.css";

const root = document.getElementById("root");

if (root) {
  void loadInitialProps()
    .then((props) => hydrateRoot(root, <App {...props} />))
    .catch((error: unknown) => {
      console.error("Failed to hydrate blog app", error);
    });
}

async function loadInitialProps(): Promise<AppProps> {
  const common = await fetchJson<CommonPayload>("/manifest/common.json");
  const route = findRoute(common, new URL(window.location.href));
  return restoreInitialDomContent({
    content: common.content,
    route
  });
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load ${url}: ${response.status}`);
  return response.json() as Promise<T>;
}

function findRoute(common: CommonPayload, url: URL) {
  const routePath = normalizeRoutePath(url.pathname);
  return common.routes.find((route) => route.route === routePath) ?? common.routes.find((route) => route.kind === "not-found") ?? common.routes[0];
}

function restoreInitialDomContent(props: AppProps): AppProps {
  if (props.route.kind === "home") return restoreInitialPostList(props);
  return restoreInitialArticleHtml(props);
}

function restoreInitialPostList(props: AppProps): AppProps {
  const excerpts = new Map<string, string>();
  for (const card of document.querySelectorAll<HTMLElement>("main article.content-card")) {
    const link = card.querySelector<HTMLAnchorElement>('h2 a[href*="/posts/"]');
    const html = card.querySelector<HTMLElement>(".article-content")?.innerHTML;
    if (!link || !html) continue;
    excerpts.set(normalizeRoutePath(new URL(link.href).pathname), html);
  }

  if (excerpts.size === 0) return props;

  return {
    ...props,
    content: {
      ...props.content,
      posts: props.content.posts.map((post) => {
        const excerptHtml = excerpts.get(post.route);
        return excerptHtml ? { ...post, excerptHtml } : post;
      })
    }
  };
}

function restoreInitialArticleHtml(props: AppProps): AppProps {
  const html = document.querySelector<HTMLElement>(".article-content")?.innerHTML;
  if (!html) return props;

  if (props.route.kind === "post" && props.route.params?.abbrlink) {
    return {
      ...props,
      content: {
        ...props.content,
        posts: props.content.posts.map((post) =>
          post.abbrlink === props.route.params?.abbrlink
            ? {
                ...post,
                bodyHtml: html,
                toc: restoreInitialToc()
              }
            : post
        )
      }
    };
  }

  if (props.route.kind === "page") {
    return {
      ...props,
      content: {
        ...props.content,
        pages: props.content.pages.map((page) => (page.route === props.route.route ? { ...page, bodyHtml: html } : page))
      }
    };
  }

  return props;
}

function restoreInitialToc() {
  return Array.from(document.querySelectorAll<HTMLAnchorElement>(".toc-scroll a[href^='#']")).map((link) => ({
    id: decodeURIComponent(link.hash.slice(1)),
    text: link.textContent?.trim() ?? "",
    level: link.closest("li")?.className.includes("ml-3") ? 3 : 2
  }));
}

function normalizeRoutePath(pathname: string) {
  let value = decodeURI(pathname);
  if (value.endsWith("/index.html")) value = value.slice(0, -"index.html".length);
  if (!value.startsWith("/")) value = `/${value}`;
  if (value === "") value = "/";
  if (!value.endsWith("/") && !value.endsWith(".html")) value = `${value}/`;
  return value;
}
