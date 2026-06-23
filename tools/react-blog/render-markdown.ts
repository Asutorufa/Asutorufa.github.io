import MarkdownIt from "markdown-it";
import markdownItKatex from "@renbaoshuo/markdown-it-katex";
import { createHighlighter, type Highlighter } from "shiki";
import type { TocItem } from "../../src/types/content";

type RenderRule = NonNullable<MarkdownIt["renderer"]["rules"][string]>;

const shikiLanguages = [
  "asm",
  "bash",
  "c",
  "cpp",
  "css",
  "diff",
  "dockerfile",
  "go",
  "html",
  "ini",
  "java",
  "javascript",
  "json",
  "kotlin",
  "latex",
  "lua",
  "make",
  "markdown",
  "nginx",
  "php",
  "powershell",
  "python",
  "ruby",
  "rust",
  "scss",
  "sql",
  "toml",
  "tsx",
  "typescript",
  "vue",
  "xml",
  "yaml"
];

let markdownPromise: Promise<MarkdownIt> | undefined;

export async function renderMarkdownToHtml(source: string, options: RenderOptions = {}) {
  return (await renderMarkdown(source, options)).html;
}

export async function renderMarkdown(source: string, options: RenderOptions = {}): Promise<{ html: string; toc: TocItem[] }> {
  const markdown = await getMarkdown();
  const env: RenderEnv = { assetBasePath: options.assetBasePath, toc: [], slugs: new Map() };
  return {
    html: markdown.render(source, env),
    toc: env.toc ?? []
  };
}

async function getMarkdown() {
  markdownPromise ??= createMarkdown();
  return markdownPromise;
}

async function createMarkdown() {
  const highlighter = await createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: shikiLanguages
  });

  const markdown: MarkdownIt = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
    langPrefix: "language-",
    highlight(source: string, language: string): string {
      const normalized = normalizeCodeLanguage(language);
      if (normalized && hasLanguage(highlighter, normalized)) {
        const highlighted = highlighter.codeToHtml(source, {
          lang: normalized,
          themes: {
            light: "github-light",
            dark: "github-dark"
          }
        });
        return `<pre class="shiki code-block language-${escapeHtml(normalized)}"><code>${codeLinesFromShiki(highlighted)}</code></pre>`;
      }

      return `<pre class="shiki code-block"><code>${codeLines(escapeHtml(source))}</code></pre>`;
    }
  }).use(markdownItKatex, {
    skipDelimitersCheck: true
  });

  const defaultFence: RenderRule = markdown.renderer.rules.fence ?? ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  markdown.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const language = token.info.trim().split(/\s+/)[0]?.toLowerCase();

    if (language === "mermaid") {
      return `<div class="mermaid mermaid-pending" data-mermaid-source="${escapeHtml(token.content)}" aria-busy="true"></div>`;
    }

    return defaultFence(tokens, idx, options, env, self);
  };

  const defaultImage = markdown.renderer.rules.image ?? ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  markdown.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const state = env as RenderEnv;
    const src = token.attrGet("src");
    if (src) {
      token.attrSet("src", resolveAssetSrc(src, state.assetBasePath));
    }
    token.attrSet("loading", token.attrGet("loading") ?? "lazy");
    token.attrSet("decoding", token.attrGet("decoding") ?? "async");
    return defaultImage(tokens, idx, options, env, self);
  };

  const defaultHeadingOpen = markdown.renderer.rules.heading_open ?? ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  markdown.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const heading = tokens[idx];
    const inline = tokens[idx + 1];
    const level = Number(heading.tag.slice(1));
    const state = env as RenderEnv;
    const text = inline?.type === "inline" ? inline.content.trim() : "";

    if (text && level >= 2 && level <= 3) {
      state.slugs ??= new Map();
      const id = uniqueSlug(text, state.slugs);
      heading.attrSet("id", id);
      state.toc?.push({ id, text, level });
    }

    return defaultHeadingOpen(tokens, idx, options, env, self);
  };

  return markdown;
}

type RenderEnv = {
  assetBasePath?: string;
  toc?: TocItem[];
  slugs?: Map<string, number>;
};

type RenderOptions = {
  assetBasePath?: string;
};

function resolveAssetSrc(src: string, assetBasePath?: string) {
  if (!assetBasePath || !isRelativeAssetSrc(src)) return src;

  const basePath = assetBasePath.endsWith("/") ? assetBasePath : `${assetBasePath}/`;
  try {
    const url = new URL(src, `https://asutorufa.local${basePath}`);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return src;
  }
}

function isRelativeAssetSrc(src: string) {
  return Boolean(src) && !src.startsWith("/") && !src.startsWith("#") && !src.startsWith("//") && !/^[a-z][a-z\d+.-]*:/i.test(src);
}

function uniqueSlug(text: string, slugs: Map<string, number>) {
  const base = slugify(text);
  const count = slugs.get(base) ?? 0;
  slugs.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function slugify(text: string) {
  const value = text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{Letter}\p{Number}\s_-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
  return value || "section";
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function codeLines(highlightedHtml: string) {
  return codeLinesFromLines(trimTrailingBlankLines(splitHighlightedLines(highlightedHtml.replace(/\n+$/, ""))));
}

function codeLinesFromShiki(shikiHtml: string) {
  const code = shikiHtml.match(/<code>([\s\S]*)<\/code>/)?.[1] ?? escapeHtml(shikiHtml);
  const lines = trimTrailingBlankLines(code.replace(/\n+$/, "").split("\n").map(stripShikiLineWrapper));
  return codeLinesFromLines(lines.length ? lines : [""]);
}

function codeLinesFromLines(lines: string[]) {
  return lines.map((line) => `<span class="code-line"><span class="code-line-content">${line || " "}</span></span>`).join("");
}

function stripShikiLineWrapper(line: string) {
  if (!line.startsWith('<span class="line"')) return line;
  return line.replace(/^<span class="line">/, "").replace(/<\/span>$/, "");
}

function trimTrailingBlankLines(lines: string[]) {
  let end = lines.length;
  while (end > 1 && isBlankCodeLine(lines[end - 1])) end -= 1;
  return lines.slice(0, end);
}

function isBlankCodeLine(line: string) {
  return (
    line
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&#160;/g, " ")
      .trim() === ""
  );
}

function splitHighlightedLines(highlightedHtml: string) {
  const lines: string[] = [];
  const openTags: string[] = [];
  let current = "";
  let index = 0;

  const reopenTags = () => openTags.join("");
  const closeOpenTags = () =>
    openTags
      .slice()
      .reverse()
      .map((tag) => `</${tagName(tag)}>`)
      .join("");

  while (index < highlightedHtml.length) {
    const char = highlightedHtml[index];

    if (char === "\n") {
      lines.push(current + closeOpenTags());
      current = reopenTags();
      index += 1;
      continue;
    }

    if (char === "<") {
      const end = highlightedHtml.indexOf(">", index);
      if (end === -1) {
        current += highlightedHtml.slice(index);
        break;
      }

      const tag = highlightedHtml.slice(index, end + 1);
      current += tag;
      updateOpenTags(openTags, tag);
      index = end + 1;
      continue;
    }

    current += char;
    index += 1;
  }

  lines.push(current + closeOpenTags());
  return lines.length ? lines : [""];
}

function updateOpenTags(openTags: string[], tag: string) {
  if (!/^<span\b/i.test(tag) && !/^<\/span>/i.test(tag)) return;

  if (/^<\/span>/i.test(tag)) {
    openTags.pop();
    return;
  }

  if (!/\/>$/.test(tag)) {
    openTags.push(tag);
  }
}

function tagName(tag: string) {
  return tag.match(/^<\s*([a-z0-9-]+)/i)?.[1] ?? "span";
}

function normalizeCodeLanguage(language?: string) {
  const value = language?.trim().toLowerCase();
  if (!value) return "";

  const aliases: Record<string, string> = {
    assembly: "asm",
    js: "javascript",
    ts: "typescript",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    yml: "yaml",
    md: "markdown",
    py: "python",
    rs: "rust",
    golang: "go",
    hcl: "terraform",
    protobuf: "proto"
  };

  return aliases[value] ?? value;
}

function hasLanguage(highlighter: Highlighter, language: string) {
  try {
    highlighter.getLanguage(language);
    return true;
  } catch {
    return false;
  }
}
