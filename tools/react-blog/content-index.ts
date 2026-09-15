import type { ContentManifest, Post, SiteLanguage, ThreatReport } from "../../src/types/content";

export type ContentIndex = {
  postsByAbbrlink: Map<string, Post>;
  wipPostsByAbbrlink: Map<string, Post>;
  threatReportsById: Map<string, Map<SiteLanguage, ThreatReport>>;
  postsByYear: Map<string, Post[]>;
  postsByMonth: Map<string, Post[]>;
  postsByTag: Map<string, Post[]>;
  postsByCategory: Map<string, Post[]>;
};

const indexes = new WeakMap<ContentManifest, ContentIndex>();

export function contentIndex(content: ContentManifest) {
  const cached = indexes.get(content);
  if (cached) return cached;

  const index: ContentIndex = {
    postsByAbbrlink: new Map(content.posts.map((post) => [post.abbrlink, post])),
    wipPostsByAbbrlink: new Map(content.wipPosts.map((post) => [post.abbrlink, post])),
    threatReportsById: groupThreatReportsById(content.threatReports),
    postsByYear: new Map(),
    postsByMonth: new Map(),
    postsByTag: new Map(),
    postsByCategory: new Map()
  };

  for (const post of content.posts) {
    addToIndex(index.postsByYear, post.date.slice(0, 4), post);
    addToIndex(index.postsByMonth, post.date.slice(0, 7), post);
    for (const tag of post.tags) addToIndex(index.postsByTag, tag, post);
    for (const category of post.categories) addToIndex(index.postsByCategory, category, post);
  }

  indexes.set(content, index);
  return index;
}

function groupThreatReportsById(reports: ThreatReport[]) {
  const result = new Map<string, Map<SiteLanguage, ThreatReport>>();
  for (const report of reports) {
    const translations = result.get(report.id) ?? new Map<SiteLanguage, ThreatReport>();
    translations.set(report.language, report);
    result.set(report.id, translations);
  }
  return result;
}

function addToIndex(index: Map<string, Post[]>, key: string, post: Post) {
  if (!key) return;
  const posts = index.get(key);
  if (posts) posts.push(post);
  else index.set(key, [post]);
}
