import type { ContentManifest, Page, Post, RouteEntry } from "../types/content";

export type AppProps = {
  content: ContentManifest;
  route: RouteEntry;
};

export type CommonContent = Pick<ContentManifest, "config" | "stats">;

export type PagePayload = {
  route: RouteEntry;
  commonContent?: CommonContent;
  description?: string;
  post?: Post;
  newerPost?: Post;
  olderPost?: Post;
  posts?: Post[];
  totalPages?: number;
  totalPosts?: number;
  page?: Page;
  tags?: ContentManifest["tags"];
  categories?: ContentManifest["categories"];
  archives?: ContentManifest["archives"];
};

declare global {
  interface WindowEventMap {
    "asutorufa-theme-change": CustomEvent<{ mode: "system" | "light" | "dark"; dark: boolean }>;
    "asutorufa-route-change": Event;
  }
}
