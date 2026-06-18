import MarkdownIt from "markdown-it";
import markdownItKatex from "@renbaoshuo/markdown-it-katex";
import hljs from "highlight.js";
import type { TocItem } from "../../src/types/content";

type RenderRule = (tokens: any[], idx: number, options: any, env: any, self: any) => string;

const markdown: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  langPrefix: "language-",
  highlight(source: string, language: string): string {
    const normalized = normalizeCodeLanguage(language);
    if (normalized && hljs.getLanguage(normalized)) {
      const highlighted = hljs.highlight(source, { language: normalized, ignoreIllegals: true }).value;
      return `<pre class="hljs code-block"><code class="language-${escapeHtml(normalized)}">${codeLines(highlighted)}</code></pre>`;
    }

    return `<pre class="hljs code-block"><code>${codeLines(escapeHtml(source))}</code></pre>`;
  }
}).use(markdownItKatex, {
  skipDelimitersCheck: true
});

const defaultFence: RenderRule =
  markdown.renderer.rules.fence ??
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

markdown.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const language = token.info.trim().split(/\s+/)[0]?.toLowerCase();

  if (language === "mermaid") {
    return `<div class="mermaid">${escapeHtml(token.content)}</div>`;
  }

  return defaultFence(tokens, idx, options, env, self);
};

const defaultHeadingOpen =
  markdown.renderer.rules.heading_open ??
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

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

export function renderMarkdownToHtml(source: string) {
  return renderMarkdown(source).html;
}

export function renderMarkdown(source: string): { html: string; toc: TocItem[] } {
  const env: RenderEnv = { toc: [], slugs: new Map() };
  return {
    html: markdown.render(source, env),
    toc: env.toc ?? []
  };
}

type RenderEnv = {
  toc?: TocItem[];
  slugs?: Map<string, number>;
};

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
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function codeLines(highlightedHtml: string) {
  const lines = highlightedHtml.replace(/\n$/, "").split("\n");
  const lineCount = Math.max(lines.length, 1);
  const digits = String(lineCount).length;

  return lines
    .map((line, index) => {
      const number = String(index + 1);
      return `<span class="code-line"><span class="code-line-number" aria-hidden="true" style="--line-digits:${digits}">${number}</span><span class="code-line-content">${line || " "}</span></span>`;
    })
    .join("");
}

function normalizeCodeLanguage(language?: string) {
  const value = language?.trim().toLowerCase();
  if (!value) return "";

  const aliases: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    yml: "yaml",
    md: "markdown",
    py: "python",
    rs: "rust",
    golang: "go"
  };

  return aliases[value] ?? value;
}
