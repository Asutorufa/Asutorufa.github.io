export type SiteLanguage = "en" | "ja" | "zh-Hans";

export type LanguageMeta = {
  language: SiteLanguage;
  htmlLang: string;
  locale: string;
  textDirection: "ltr" | "rtl";
  dateLocale: string;
};

export type UiLabels = {
  postedOn: string;
  modified: string;
  inCategory: string;
  home: string;
  tags: string;
  categories: string;
  archives: string;
  about: string;
  friends: string;
  tools: string;
  search: string;
  menu: string;
  closeSearch: string;
  noResults: string;
  back: string;
  readMore: string;
  posts: string;
  previous: string;
  next: string;
  tag: string;
  category: string;
  all: string;
  archiveTitle: string;
  postToc: string;
  siteOverview: string;
  themeLabel: string;
  themeSystem: string;
  themeLight: string;
  themeDark: string;
  authorLabel: string;
  permalinkLabel: string;
  copyrightLabel: string;
  copyrightText: string;
  notFound: string;
  rss: string;
  unixTimestamp: string;
  jsonFormatter: string;
};

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

export type BlogConfig = {
  title: string;
  subtitle: string;
  description: string;
  author: string;
  url: string;
  perPage: number;
};

export type Post = {
  kind: "post";
  sourcePath: string;
  route: `/posts/${string}/`;
  abbrlink: string;
  title: string;
  date: string;
  updated?: string;
  tags: string[];
  categories: string[];
  language: SiteLanguage;
  htmlLang: string;
  locale: string;
  textDirection: "ltr" | "rtl";
  dateLocale: string;
  excerptMarkdown?: string;
  excerptHtml?: string;
  moreAnchor?: string;
  bodyMarkdown: string;
  bodyHtml: string;
  rawMarkdown: string;
  plainText: string;
  toc: TocItem[];
  slugForSearch: string;
  comments: boolean;
  math: boolean;
  mermaid: boolean;
};

export type Page = {
  kind: "page";
  sourcePath: string;
  route: string;
  title: string;
  date?: string;
  updated?: string;
  language: SiteLanguage;
  htmlLang: string;
  locale: string;
  textDirection: "ltr" | "rtl";
  dateLocale: string;
  bodyMarkdown: string;
  bodyHtml: string;
  rawMarkdown: string;
  plainText: string;
  comments: boolean;
};

export type ContentManifest = {
  config: BlogConfig;
  stats: {
    posts: number;
    pages: number;
    tags: number;
    categories: number;
    archives: number;
  };
  posts: Post[];
  pages: Page[];
  tags: Array<{ name: string; route: string; count: number }>;
  categories: Array<{ name: string; route: string; count: number }>;
  archives: Array<{ year: string; route: string; count: number }>;
  currentList?: {
    totalPages: number;
    totalPosts: number;
  };
  languageFallbacks?: Array<{ sourcePath: string; rawLanguage: string }>;
};

export type RouteKind =
  | "home"
  | "post"
  | "page"
  | "archives"
  | "archive-year"
  | "archive-month"
  | "archives-page"
  | "archive-year-page"
  | "archive-month-page"
  | "tags"
  | "tag"
  | "tag-page"
  | "categories"
  | "category"
  | "category-page"
  | "tools"
  | "not-found";

export type RouteEntry = {
  route: string;
  outputPath: string;
  kind: RouteKind;
  title: string;
  language: SiteLanguage;
  params?: Record<string, string>;
};
