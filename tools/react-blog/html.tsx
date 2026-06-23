import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { PAGE_PAYLOAD_SCRIPT_ID } from "../../src/app/page-payload-html";
import { LANGUAGE_META } from "../../src/data/i18n";
import type { CommonContent, PagePayload } from "../../src/app/app-types";
import type { ContentManifest, Post, RouteEntry } from "../../src/types/content";

export type ClientAssets = {
  scripts: string[];
  styles: string[];
};

const THEME_COLOR_LIGHT = "#f7f7f7";
const THEME_COLOR_DARK = "#282828";

export function renderHtmlShell(options: { appHtml: string; assets: ClientAssets; content: ContentManifest; pagePayload: PagePayload; route: RouteEntry }) {
  const { appHtml, assets, content, pagePayload, route } = options;
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
        <meta property="og:type" content={route.kind === "post" || route.kind === "wip-post" ? "article" : "website"} />
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
        <script async src="/js/analytics.js" />
        <title>{title}</title>
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: appHtml }} />
        <script id={PAGE_PAYLOAD_SCRIPT_ID} type="application/json" dangerouslySetInnerHTML={{ __html: scriptJson(pagePayload) }} />
        {assets.scripts.map((src) => (
          <script key={src} type="module" src={src} />
        ))}
      </body>
    </html>
  );

  return `<!doctype html>${renderToStaticMarkup(shell)}`;
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
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function routeDescription(content: ContentManifest, route: RouteEntry) {
  if (route.kind === "post" && route.params?.abbrlink) {
    const post = content.posts.find((item) => item.abbrlink === route.params?.abbrlink);
    return post?.plainText.slice(0, 160) ?? content.config.subtitle;
  }
  if (route.kind === "wip-post" && route.params?.abbrlink) {
    const post = content.wipPosts.find((item) => item.abbrlink === route.params?.abbrlink);
    return post?.plainText.slice(0, 160) ?? content.config.subtitle;
  }
  return content.config.description || content.config.subtitle;
}

function canonicalHostRedirectScript(siteUrl: string) {
  const canonical = new URL(siteUrl);
  const origin = `${canonical.protocol}//${canonical.host}`;

  return `(()=>{const l=location,h=l.hostname.toLowerCase();h==="asutorufa.github.io"&&(h!==${JSON.stringify(canonical.hostname)}||l.protocol!==${JSON.stringify(canonical.protocol)})&&l.replace(${JSON.stringify(origin)}+l.pathname+l.search+l.hash)})();`;
}

function themeBootstrapScript() {
  return `(()=>{let p="system";try{p=localStorage.getItem("asutorufa-theme")||p}catch{}p=p==="light"||p==="dark"||p==="system"?p:"system";const d=p==="dark"||p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches,r=document.documentElement,m=document.querySelector('meta[name="theme-color"]');r.classList.toggle("dark-mode",d);r.classList.toggle("light-mode",!d);r.dataset.themePreference=p;m?.setAttribute("content",d?${JSON.stringify(THEME_COLOR_DARK)}:${JSON.stringify(THEME_COLOR_LIGHT)})})();`;
}

export function commonContentForClient(content: ContentManifest): CommonContent {
  return {
    config: content.config,
    stats: content.stats
  };
}

export function postForListPayload(post: Post): Post {
  return stripPostForClient(post, {
    excerptHtml: post.excerptHtml ?? "",
    bodyHtml: "",
    toc: []
  });
}

export function postForAdjacentPayload(post: Post): Post {
  return stripPostForClient(post, {
    excerptHtml: "",
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

export function postForEmbeddedArticlePayload(post: Post): Post {
  return stripPostForClient(post, {
    excerptHtml: "",
    bodyHtml: "",
    toc: post.toc
  });
}

export function pageForPayload(contentPage: ContentManifest["pages"][number], options: { bodyHtml?: string } = {}): ContentManifest["pages"][number] {
  return stripPageForClient(contentPage, options.bodyHtml ?? contentPage.bodyHtml);
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

function scriptJson(value: unknown) {
  return JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
}
