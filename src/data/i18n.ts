import type { LanguageMeta, SiteLanguage, UiLabels } from "../types/content";

export const DEFAULT_LANGUAGE: SiteLanguage = "ja";

export const LANGUAGE_META: Record<SiteLanguage, LanguageMeta> = {
  en: {
    language: "en",
    htmlLang: "en",
    locale: "en_US",
    textDirection: "ltr",
    dateLocale: "en-US"
  },
  ja: {
    language: "ja",
    htmlLang: "ja",
    locale: "ja_JP",
    textDirection: "ltr",
    dateLocale: "ja-JP"
  },
  "zh-Hans": {
    language: "zh-Hans",
    htmlLang: "zh-Hans",
    locale: "zh_CN",
    textDirection: "ltr",
    dateLocale: "zh-CN"
  }
};

export const UI_LABELS: Record<SiteLanguage, UiLabels> = {
  en: {
    postedOn: "Posted on",
    modified: "Post modified:",
    inCategory: "In",
    home: "Home",
    tags: "Tags",
    categories: "Categories",
    archives: "Archives",
    about: "About",
    friends: "Friends",
    tools: "Tools",
    threatIntelligence: "Threat Intelligence",
    threats: "threats",
    threatDescription: "Daily security intelligence collected from public sources.",
    latest: "Latest",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    exploited: "Exploited",
    noThreatReports: "No threat intelligence reports yet.",
    previousReport: "Previous report",
    nextReport: "Next report",
    threatLanguageNames: { "zh-Hans": "中文", en: "English", ja: "日本語" },
    search: "Search",
    menu: "Menu",
    closeSearch: "Close search",
    noResults: "No results.",
    back: "Back",
    readMore: "Read more",
    posts: "posts",
    previous: "Prev",
    next: "Next",
    tag: "Tag",
    category: "Category",
    all: "All",
    allTags: "All tags",
    popularTags: "Popular tags",
    tagSearchPlaceholder: "Search tags...",
    tagSearchResults: "Matches",
    otherTags: "Other",
    archiveTitle: "Archives",
    postToc: "Table of Contents",
    siteOverview: "Overview",
    themeLabel: "Theme",
    themeSystem: "System",
    themeLight: "Light",
    themeDark: "Dark",
    authorLabel: "Author:",
    permalinkLabel: "Permalink:",
    copyrightLabel: "License:",
    copyrightText: "Except where otherwise noted, all articles on this blog are licensed under",
    notFound: "Page not found.",
    rss: "RSS",
    unixTimestamp: "Unix Timestamp",
    jsonFormatter: "JSON Formatter"
  },
  ja: {
    postedOn: "投稿日",
    modified: "更新日:",
    inCategory: "カテゴリ",
    home: "ホーム",
    tags: "タグ",
    categories: "カテゴリ",
    archives: "アーカイブ",
    about: "プロフィール",
    friends: "リンク",
    tools: "ツール",
    threatIntelligence: "脅威インテリジェンス",
    threats: "件の脅威",
    threatDescription: "公開情報から収集した日々のセキュリティインテリジェンス。",
    latest: "最新",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    exploited: "悪用確認",
    noThreatReports: "脅威インテリジェンスのレポートはまだありません。",
    previousReport: "前のレポート",
    nextReport: "次のレポート",
    threatLanguageNames: { "zh-Hans": "中国語", en: "English", ja: "日本語" },
    search: "検索",
    menu: "メニュー",
    closeSearch: "検索を閉じる",
    noResults: "結果がありません。",
    back: "戻る",
    readMore: "Read more",
    posts: "記事",
    previous: "前へ",
    next: "次へ",
    tag: "タグ",
    category: "カテゴリ",
    all: "全",
    allTags: "全タグ",
    popularTags: "よく使うタグ",
    tagSearchPlaceholder: "タグを検索...",
    tagSearchResults: "検索結果",
    otherTags: "その他",
    archiveTitle: "アーカイブ",
    postToc: "文章目録",
    siteOverview: "サイト概況",
    themeLabel: "テーマ",
    themeSystem: "自動",
    themeLight: "ライト",
    themeDark: "ダーク",
    authorLabel: "本文作者:",
    permalinkLabel: "本文リンク:",
    copyrightLabel: "版権声明:",
    copyrightText: "特別な声明がない限り、本ブログの記事は",
    notFound: "ページが見つかりません。",
    rss: "RSS",
    unixTimestamp: "Unix Timestamp",
    jsonFormatter: "JSON整形"
  },
  "zh-Hans": {
    postedOn: "发布于",
    modified: "更新于:",
    inCategory: "分类",
    home: "首页",
    tags: "标签",
    categories: "分类",
    archives: "归档",
    about: "关于",
    friends: "友链",
    tools: "工具",
    threatIntelligence: "威胁情报",
    threats: "项威胁",
    threatDescription: "从公开来源收集的每日安全情报。",
    latest: "最新",
    critical: "严重",
    high: "高危",
    medium: "中危",
    low: "低危",
    exploited: "已遭利用",
    noThreatReports: "暂无威胁情报日报。",
    previousReport: "上一份日报",
    nextReport: "下一份日报",
    threatLanguageNames: { "zh-Hans": "中文", en: "English", ja: "日本語" },
    search: "搜索",
    menu: "菜单",
    closeSearch: "关闭搜索",
    noResults: "没有结果。",
    back: "返回",
    readMore: "Read more",
    posts: "文章",
    previous: "上一页",
    next: "下一页",
    tag: "标签",
    category: "分类",
    all: "全",
    allTags: "全部标签",
    popularTags: "常用标签",
    tagSearchPlaceholder: "搜索标签...",
    tagSearchResults: "搜索结果",
    otherTags: "其他",
    archiveTitle: "归档",
    postToc: "文章目录",
    siteOverview: "站点概览",
    themeLabel: "主题",
    themeSystem: "系统",
    themeLight: "浅色",
    themeDark: "深色",
    authorLabel: "本文作者:",
    permalinkLabel: "本文链接:",
    copyrightLabel: "版权声明:",
    copyrightText: "本博客所有文章除特别声明外，均采用",
    notFound: "页面不存在。",
    rss: "RSS",
    unixTimestamp: "Unix 时间戳",
    jsonFormatter: "JSON 格式化"
  }
};

export function normalizeLanguage(input: unknown): {
  language: SiteLanguage;
  fallback: boolean;
  rawLanguage: string;
} {
  const rawLanguage = String(input ?? "").trim();

  if (!rawLanguage) {
    return { language: DEFAULT_LANGUAGE, fallback: true, rawLanguage };
  }

  if (/^zh[-_]?hans$/i.test(rawLanguage) || /^zh[-_]?cn$/i.test(rawLanguage)) {
    return { language: "zh-Hans", fallback: rawLanguage !== "zh-Hans", rawLanguage };
  }

  if (/^ja([-_].*)?$/i.test(rawLanguage)) {
    return { language: "ja", fallback: rawLanguage !== "ja", rawLanguage };
  }

  if (/^en([-_].*)?$/i.test(rawLanguage)) {
    return { language: "en", fallback: rawLanguage !== "en", rawLanguage };
  }

  return { language: DEFAULT_LANGUAGE, fallback: true, rawLanguage };
}
