import type { ContentManifest, Page, Post, RouteEntry, SiteLanguage, ThreatReport } from "../types/content";
import type { ImagePreviewState } from "../components/ImagePreview";

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
  threatReports?: ThreatReport[];
  totalThreatPages?: number;
  totalThreatReports?: number;
  availableThreatLanguages?: SiteLanguage[];
  threatReport?: ThreatReport;
  previousThreatReport?: ThreatReport;
  nextThreatReport?: ThreatReport;
  threatReportTranslations?: ThreatReport[];
  page?: Page;
  tags?: ContentManifest["tags"];
  categories?: ContentManifest["categories"];
  archives?: ContentManifest["archives"];
};

declare global {
  interface WindowEventMap {
    "asutorufa-theme-change": CustomEvent<{ mode: "system" | "light" | "dark"; dark: boolean }>;
    "asutorufa-language-change": Event;
    "asutorufa-route-change": Event;
    "asutorufa-image-preview": CustomEvent<ImagePreviewState>;
  }
}
