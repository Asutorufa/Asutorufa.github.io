import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { LANGUAGE_META } from "../../src/data/i18n";
import type { ContentManifest, Post, RouteEntry } from "../../src/types/content";

export type ClientAssets = {
  scripts: string[];
  styles: string[];
};

const THEME_COLOR_LIGHT = "#f7f7f7";
const THEME_COLOR_DARK = "#282828";

export function renderHtmlShell(options: {
  appHtml: string;
  assets: ClientAssets;
  content: ContentManifest;
  route: RouteEntry;
}) {
  const { appHtml, assets, content, route } = options;
  const language = LANGUAGE_META[route.language];
  const canonical = new URL(route.route === "/404.html" ? "/" : route.route, content.config.url).toString();
  const description = routeDescription(content, route);
  const title = route.title === content.config.title ? content.config.title : `${route.title} - ${content.config.title}`;

  const shell = (
    <html lang={language.htmlLang} dir={language.textDirection}>
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content={THEME_COLOR_LIGHT} />
        <meta name="description" content={description} />
        <meta name="keywords" content="program" />
        <meta property="og:type" content={route.kind === "post" ? "article" : "website"} />
        <meta property="og:title" content={route.title} />
        <meta property="og:url" content={canonical} />
        <meta property="og:site_name" content={content.config.title} />
        <meta property="og:description" content={description} />
        <meta property="og:locale" content={language.locale} />
        <meta name="twitter:card" content="summary" />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" href="/atom.xml" title={content.config.title} type="application/atom+xml" />
        <link rel="icon" type="image/svg+xml" href="/images/bighead.svg" />
        <script dangerouslySetInnerHTML={{ __html: canonicalHostRedirectScript(content.config.url) }} />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript() }} />
        {assets.styles.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-JN3GB41L9H" />
        <script dangerouslySetInnerHTML={{ __html: analyticsScript() }} />
        <title>{title}</title>
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: appHtml }} />
        {assets.scripts.map((src) => (
          <script key={src} type="module" src={src} />
        ))}
      </body>
    </html>
  );

  return `<!doctype html>\n${renderToStaticMarkup(shell)}\n`;
}

export function readViteAssets(manifest: Record<string, { file?: string; css?: string[]; imports?: string[] }>): ClientAssets {
  const entry = manifest["index.html"] ?? manifest["src/app/entry-client.tsx"];
  if (!entry?.file) {
    throw new Error("Unable to find Vite client entry in manifest");
  }

  return {
    scripts: [`/${entry.file}`],
    styles: [...new Set((entry.css ?? []).map((item) => `/${item}`))]
  };
}

export function routeOutputFile(distDir: string, outputPath: string) {
  return path.join(distDir, outputPath);
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function routeDescription(content: ContentManifest, route: RouteEntry) {
  if (route.kind === "post" && route.params?.abbrlink) {
    const post = content.posts.find((item) => item.abbrlink === route.params?.abbrlink);
    return post?.plainText.slice(0, 160) ?? content.config.subtitle;
  }
  return content.config.description || content.config.subtitle;
}

function canonicalHostRedirectScript(siteUrl: string) {
  const canonical = new URL(siteUrl);
  const origin = `${canonical.protocol}//${canonical.host}`;

  return `
(() => {
  const canonicalHost = ${JSON.stringify(canonical.hostname)};
  const canonicalOrigin = ${JSON.stringify(origin)};
  const hostname = location.hostname.toLocaleLowerCase("en-US");
  const redirectHosts = new Set(["asutorufa.github.io"]);

  if (redirectHosts.has(hostname) && (hostname !== canonicalHost || location.protocol !== ${JSON.stringify(canonical.protocol)})) {
    location.replace(canonicalOrigin + location.pathname + location.search + location.hash);
  }
})();
`;
}

function themeBootstrapScript() {
  return `
(() => {
  const key = "asutorufa-theme";
  const root = document.documentElement;
  let stored = "system";
  try {
    stored = localStorage.getItem(key) || "system";
  } catch {
    stored = "system";
  }
  const preference = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  const dark = preference === "dark" || (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark-mode", dark);
  root.classList.toggle("light-mode", !dark);
  root.dataset.themePreference = preference;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute("content", dark ? ${JSON.stringify(THEME_COLOR_DARK)} : ${JSON.stringify(THEME_COLOR_LIGHT)});
})();
`;
}

function analyticsScript() {
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag("js", new Date());
gtag("config", "G-JN3GB41L9H");
`;
}

export function commonContentForClient(content: ContentManifest): ContentManifest {
  return {
    ...content,
    posts: content.posts.map((post): Post => stripPostForClient(post, { excerptHtml: "", bodyHtml: "", toc: [] })),
    pages: content.pages.map((page) => stripPageForClient(page, "")),
    languageFallbacks: []
  };
}

export function postForListPayload(post: Post): Post {
  return stripPostForClient(post, {
    excerptHtml: post.excerptHtml ?? "",
    bodyHtml: "",
    toc: []
  });
}

export function postForArticlePayload(post: Post): Post {
  return stripPostForClient(post, {
    excerptHtml: "",
    bodyHtml: post.bodyHtml,
    toc: post.toc
  });
}

export function pageForPayload(contentPage: ContentManifest["pages"][number]): ContentManifest["pages"][number] {
  return stripPageForClient(contentPage, contentPage.bodyHtml);
}

function stripPostForClient(post: Post, options: { excerptHtml: string; bodyHtml: string; toc: Post["toc"] }): Post {
  return {
    ...post,
    bodyMarkdown: "",
    bodyHtml: options.bodyHtml,
    rawMarkdown: "",
    plainText: "",
    excerptMarkdown: "",
    excerptHtml: options.excerptHtml,
    toc: options.toc
  };
}

function stripPageForClient(contentPage: ContentManifest["pages"][number], bodyHtml: string): ContentManifest["pages"][number] {
  return {
    ...contentPage,
    bodyMarkdown: "",
    bodyHtml,
    rawMarkdown: "",
    plainText: ""
  };
}
