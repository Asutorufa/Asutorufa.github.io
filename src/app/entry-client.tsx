import { hydrateRoot } from "react-dom/client";
import { App } from "./App";
import "gitalk/dist/gitalk.css";
import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";
import "../styles/app.css";

const root = document.getElementById("root");

if (root && window.__BLOG_DATA__) {
  hydrateRoot(root, <App {...window.__BLOG_DATA__} />);
}
