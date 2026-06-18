import type { ContentManifest, RouteEntry } from "../types/content";

export type AppProps = {
  content: ContentManifest;
  route: RouteEntry;
};

declare global {
  interface Window {
    __BLOG_DATA__?: AppProps;
  }

  interface WindowEventMap {
    "asutorufa-theme-change": CustomEvent<{ mode: "system" | "light" | "dark"; dark: boolean }>;
    "asutorufa-route-change": Event;
  }
}
