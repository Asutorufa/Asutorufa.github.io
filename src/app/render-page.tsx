import { renderToString } from "react-dom/server";
import { App } from "./App";
import type { AppProps } from "./app-types";

export function renderPage(props: AppProps) {
  return renderToString(<App {...props} />);
}
