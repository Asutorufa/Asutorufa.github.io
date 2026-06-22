import { hydrateRoot } from "react-dom/client";
import { App } from "./App";
import { commonContent } from "../generated/blog-common";
import type { AppProps } from "./app-types";
import { readEmbeddedPagePayload } from "./page-payload-html";
import { mergePagePayload } from "./page-payload";
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
  const payload = readEmbeddedPagePayload();
  return {
    content: mergePagePayload(commonContent, payload),
    route: payload.route
  };
}
