import type { ContentManifest, Page, Post, RouteEntry } from "../types/content";

export type AppProps = {
  content: ContentManifest;
  route: RouteEntry;
};

export type CommonPayload = {
  content: ContentManifest;
  routes: RouteEntry[];
};

export type PagePayload = {
  route: RouteEntry;
  description?: string;
  post?: Post;
  posts?: Post[];
  page?: Page;
};

declare global {
  interface WindowEventMap {
    "asutorufa-theme-change": CustomEvent<{ mode: "system" | "light" | "dark"; dark: boolean }>;
    "asutorufa-route-change": Event;
  }
}
