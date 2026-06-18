import path from "node:path";
import { LANGUAGE_META } from "../../src/data/i18n";
import type { ContentManifest, Post, RouteEntry } from "../../src/types/content";

export type ClientAssets = {
  scripts: string[];
  styles: string[];
};

export function renderHtmlShell(options: {
  appHtml: string;
  assets: ClientAssets;
  content: ContentManifest;
  route: RouteEntry;
  clientData: unknown;
}) {
  const { appHtml, assets, content, route, clientData } = options;
  const language = LANGUAGE_META[route.language];
  const canonical = new URL(route.route === "/404.html" ? "/" : route.route, content.config.url).toString();
  const description = routeDescription(content, route);
  const title = route.title === content.config.title ? content.config.title : `${route.title} - ${content.config.title}`;

  return `<!doctype html>
<html lang="${language.htmlLang}" dir="${language.textDirection}">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta name="theme-color" content="#FFF0F5" />
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="keywords" content="program" />
  <meta property="og:type" content="${route.kind === "post" ? "article" : "website"}" />
  <meta property="og:title" content="${escapeHtml(route.title)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:site_name" content="${escapeHtml(content.config.title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:locale" content="${language.locale}" />
  <meta name="twitter:card" content="summary" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" href="/atom.xml" title="${escapeHtml(content.config.title)}" type="application/atom+xml" />
  <link rel="icon" type="image/svg+xml" href="/images/bighead.svg" />
  <script>
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
      if (themeColor) themeColor.setAttribute("content", dark ? "#1f1f1f" : "#FFF0F5");
    })();
  </script>
${assets.styles.map((href) => `  <link rel="stylesheet" href="${href}" />`).join("\n")}
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8681435945442113" crossorigin="anonymous"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JN3GB41L9H"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-JN3GB41L9H');
  </script>
  <title>${escapeHtml(title)}</title>
</head>
<body>
  <div id="root">${appHtml}</div>
  <script>window.__BLOG_DATA__=${serializeJson(clientData)};</script>
${assets.scripts.map((src) => `  <script type="module" src="${src}"></script>`).join("\n")}
</body>
</html>
`;
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

function serializeJson(value: unknown) {
  return JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
}

export function pruneForClient(content: ContentManifest, route: RouteEntry): ContentManifest {
  const currentPost = route.params?.abbrlink;
  const currentPageRoute = route.route;
  return {
    ...content,
    posts: content.posts.map((post): Post => {
      if (post.abbrlink === currentPost) return post;
      return {
        ...post,
        bodyMarkdown: "",
        bodyHtml: "",
        rawMarkdown: "",
        plainText: "",
        excerptMarkdown: post.excerptMarkdown
      };
    }),
    pages: content.pages.map((page) => {
      if (page.route === currentPageRoute) return page;
      return {
        ...page,
        bodyMarkdown: "",
        bodyHtml: "",
        rawMarkdown: "",
        plainText: ""
      };
    })
  };
}
