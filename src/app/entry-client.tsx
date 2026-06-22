import { hydrateRoot } from "react-dom/client";
import { App } from "./App";
import type { AppProps, CommonPayload, PagePayload } from "./app-types";
import { mergePagePayload } from "./page-payload";
import "katex/dist/katex.min.css";
import "yet-another-react-lightbox/styles.css";
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
  const payload = await fetchJson<PagePayload>(pagePayloadUrl(route.outputPath));
  return {
    content: mergePagePayload(common.content, payload),
    route: payload.route
  };
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

function pagePayloadUrl(outputPath: string) {
  return `/manifest/pages/${outputPath.replace(/^\//, "")}.json`;
}

function normalizeRoutePath(pathname: string) {
  let value = decodeURI(pathname);
  if (value.endsWith("/index.html")) value = value.slice(0, -"index.html".length);
  if (!value.startsWith("/")) value = `/${value}`;
  if (value === "") value = "/";
  if (!value.endsWith("/") && !value.endsWith(".html")) value = `${value}/`;
  return value;
}
