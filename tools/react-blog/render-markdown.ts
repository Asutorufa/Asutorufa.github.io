import MarkdownIt, { type Token } from "markdown-it";
import markdownItKatex from "@renbaoshuo/markdown-it-katex";
import { createHighlighter, type Highlighter } from "shiki";
import type { TocItem } from "../../src/types/content";

type MarkdownItInstance = InstanceType<typeof MarkdownIt>;
type RenderRule = NonNullable<MarkdownItInstance["renderer"]["rules"][string]>;

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

let markdownPromise: Promise<MarkdownItInstance> | undefined;

export async function renderMarkdownToHtml(source: string, options: RenderOptions = {}) {
  return (await renderMarkdown(source, options)).html;
}

export async function renderMarkdown(source: string, options: RenderOptions = {}): Promise<{ html: string; toc: TocItem[] }> {
  const markdown = await getMarkdown();
  const env: RenderEnv = { assetBasePath: options.assetBasePath, toc: [], slugs: new Map() };
  const tokens = options.variant === "threat" ? markdown.parse(source, env) : undefined;
  return {
    html: tokens ? renderThreatDocument(markdown, tokens, env) : markdown.render(source, env),
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

  const markdown: MarkdownItInstance = new MarkdownIt({
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
      return `<div class="mermaid mermaid-pending" aria-busy="true"><template data-mermaid-source>${escapeHtml(token.content)}</template></div>`;
    }

    return defaultFence(tokens, idx, options, env, self);
  };

  const defaultImage = markdown.renderer.rules.image ?? ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  markdown.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const state = env as RenderEnv;
    const src = token.attrGet("src");
    if (src) {
      token.attrSet("src", resolveAssetSrc(String(src), state.assetBasePath));
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
  variant?: "threat";
};

type ThreatSectionKind = "changes" | "actions";

const THREAT_FACT_LABELS = new Set([
  "affected",
  "cve",
  "cvss",
  "kev",
  "malware",
  "product",
  "severity",
  "status",
  "threat actors",
  "threat actor",
  "vector",
  "vendor",
  "version",
  "受影响",
  "漏洞",
  "严重性",
  "状态",
  "恶意软件",
  "威胁组织",
  "攻击者",
  "产品",
  "厂商",
  "版本",
  "影響を受ける製品",
  "脆弱性",
  "深刻度",
  "ステータス",
  "マルウェア",
  "脅威アクター",
  "製品",
  "ベンダー",
  "バージョン"
]);

const THREAT_DETAIL_LABELS = new Set([
  "ioc",
  "iocs",
  "indicator",
  "indicators",
  "source",
  "sources",
  "ioc 摘要",
  "ioc サマリー",
  "指标",
  "指标摘要",
  "指標",
  "情報源",
  "ソース"
]);

const THREAT_SECTION_TITLES: Record<ThreatSectionKind, Set<string>> = {
  changes: new Set(["changes since yesterday", "相比昨天", "昨日からの変化"]),
  actions: new Set(["priority actions", "优先行动", "優先対応"])
};

function renderThreatDocument(markdown: MarkdownItInstance, tokens: Token[], env: RenderEnv) {
  let html = "";
  let cursor = 0;

  while (cursor < tokens.length) {
    const headingIndex = nextTopLevelHeading(tokens, cursor);
    if (headingIndex === -1) {
      html += renderThreatContent(markdown, tokens.slice(cursor), env);
      break;
    }

    if (headingIndex > cursor) {
      html += renderThreatContent(markdown, tokens.slice(cursor, headingIndex), env);
    }

    const headingLevel = headingLevelOf(tokens[headingIndex]);
    const sectionEnd = nextTopLevelHeading(tokens, headingIndex + 1, (level) => level <= headingLevel);
    const end = sectionEnd === -1 ? tokens.length : sectionEnd;
    const sectionTokens = tokens.slice(headingIndex, end);

    if (headingLevel === 3) {
      html += renderThreatContent(markdown, sectionTokens, env, undefined, false);
    } else if (headingLevel === 2) {
      const sectionKind = threatSectionKind(sectionTitle(sectionTokens));
      if (sectionKind) {
        sectionTokens[0].attrJoin("class", `threat-section-heading threat-section-heading-${sectionKind}`);
      }
      html += renderThreatContent(markdown, sectionTokens, env, sectionKind);
    } else {
      html += renderThreatContent(markdown, sectionTokens, env);
    }

    cursor = end;
  }

  return html;
}

function renderThreatContent(markdown: MarkdownItInstance, tokens: Token[], env: RenderEnv, sectionKind?: ThreatSectionKind, wrapEvents = true) {
  let html = "";
  let cursor = 0;
  let styledListRendered = false;

  while (cursor < tokens.length) {
    const token = tokens[cursor];
    if (wrapEvents && token.type === "heading_open" && token.tag === "h3" && token.level === 0) {
      const end = nextTopLevelHeading(tokens, cursor + 1, (level) => level <= 3);
      const eventEnd = end === -1 ? tokens.length : end;
      html += renderThreatRange(markdown, tokens, 0, cursor, env);
      html += `<section class="threat-event">${renderThreatContent(markdown, tokens.slice(cursor, eventEnd), env, undefined, false)}</section>`;
      tokens = tokens.slice(eventEnd);
      cursor = 0;
      continue;
    }

    if (isFactParagraph(tokens, cursor)) {
      html += renderThreatRange(markdown, tokens, 0, cursor, env);
      html += renderFactGrid(markdown, tokens[cursor + 1], env);
      tokens = tokens.slice(cursor + 3);
      cursor = 0;
      continue;
    }

    if (isCollapsibleHeading(tokens, cursor)) {
      const end = nextTopLevelHeading(tokens, cursor + 1);
      const detailEnd = end === -1 ? tokens.length : end;
      html += renderThreatRange(markdown, tokens, 0, cursor, env);
      html += renderThreatDetails(markdown, tokens, cursor, detailEnd, env);
      tokens = tokens.slice(detailEnd);
      cursor = 0;
      continue;
    }

    if (sectionKind && !styledListRendered && isListOpen(token)) {
      const end = matchingBlockEnd(tokens, cursor);
      html += renderThreatRange(markdown, tokens, 0, cursor, env);
      html += renderThreatList(markdown, tokens.slice(cursor, end), env, sectionKind);
      tokens = tokens.slice(end);
      cursor = 0;
      styledListRendered = true;
      continue;
    }

    cursor += 1;
  }

  return html + renderThreatRange(markdown, tokens, 0, tokens.length, env);
}

function renderThreatRange(markdown: MarkdownItInstance, tokens: Token[], start: number, end: number, env: RenderEnv) {
  return start === end ? "" : markdown.renderer.render(tokens.slice(start, end), markdown.options, env);
}

function renderFactGrid(markdown: MarkdownItInstance, token: Token, env: RenderEnv) {
  const facts = metadataFacts(token);
  if (!facts) return renderThreatRange(markdown, [token], 0, 1, env);

  return `<dl class="threat-fact-grid">${facts
    .map(({ label, value }) => `<div><dt>${escapeHtml(label)}</dt><dd>${markdown.renderInline(value, env)}</dd></div>`)
    .join("")}</dl>`;
}

function renderThreatDetails(markdown: MarkdownItInstance, tokens: Token[], start: number, end: number, env: RenderEnv) {
  const label = tokens[start + 1]?.content.trim() ?? "Details";
  const count = countListItems(tokens.slice(start + 3, end));
  const countLabel = count > 0 ? ` <span class="threat-detail-count">(${count})</span>` : "";
  const body = renderThreatContent(markdown, tokens.slice(start + 3, end), env);
  return `<details class="threat-details"><summary>${escapeHtml(label)}${countLabel}</summary><div class="threat-details-body">${body}</div></details>`;
}

function renderThreatList(markdown: MarkdownItInstance, tokens: Token[], env: RenderEnv, sectionKind: ThreatSectionKind) {
  const listTokens = tokens.map((token) => cloneToken(token));
  const listClass = sectionKind === "changes" ? "threat-change-list" : "threat-action-list";
  const listOpen = listTokens.find((token) => isListOpen(token));
  listOpen?.attrJoin("class", listClass);

  for (let index = 0; index < listTokens.length; index += 1) {
    if (listTokens[index].type !== "list_item_open") continue;
    const inline = listTokens.slice(index + 1).find((token) => token.type === "inline");
    const status = inline ? threatStatus(inline.content) : undefined;
    if (status) listTokens[index].attrSet("data-threat-status", status);
  }

  return markdown.renderer.render(listTokens, markdown.options, env);
}

function nextTopLevelHeading(tokens: Token[], start: number, predicate: (level: number) => boolean = () => true) {
  for (let index = start; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.type !== "heading_open" || token.level !== 0) continue;
    const level = headingLevelOf(token);
    if (predicate(level)) return index;
  }
  return -1;
}

function headingLevelOf(token: Token | undefined) {
  return token?.type === "heading_open" ? Number(token.tag.slice(1)) : 0;
}

function sectionTitle(tokens: Token[]) {
  return tokens[1]?.type === "inline" ? normalizeThreatLabel(tokens[1].content) : "";
}

function threatSectionKind(title: string) {
  for (const [kind, titles] of Object.entries(THREAT_SECTION_TITLES) as Array<[ThreatSectionKind, Set<string>]>) {
    if (titles.has(title)) return kind;
  }
  return undefined;
}

function isFactParagraph(tokens: Token[], index: number) {
  const open = tokens[index];
  const inline = tokens[index + 1];
  return (
    open?.type === "paragraph_open" &&
    open.level === 0 &&
    inline?.type === "inline" &&
    tokens[index + 2]?.type === "paragraph_close" &&
    metadataFacts(inline) !== undefined
  );
}

function metadataFacts(token: Token | undefined) {
  if (!token?.content) return undefined;
  const lines = token.content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return undefined;

  const facts = lines.map((line) => {
    const match = /^\*\*([^*]+):\*\*\s*(.+)$/.exec(line);
    if (!match || !THREAT_FACT_LABELS.has(normalizeThreatLabel(match[1]))) return undefined;
    return { label: match[1].trim(), value: match[2].trim() };
  });
  return facts.every((fact): fact is { label: string; value: string } => fact !== undefined) ? facts : undefined;
}

function isCollapsibleHeading(tokens: Token[], index: number) {
  const token = tokens[index];
  const inline = tokens[index + 1];
  return (
    token?.type === "heading_open" &&
    token.level === 0 &&
    token.tag === "h4" &&
    inline?.type === "inline" &&
    THREAT_DETAIL_LABELS.has(normalizeThreatLabel(inline.content))
  );
}

function isListOpen(token: Token) {
  return token.level === 0 && (token.type === "bullet_list_open" || token.type === "ordered_list_open");
}

function matchingBlockEnd(tokens: Token[], start: number) {
  const open = tokens[start];
  const closeType = open.type.replace("_open", "_close");
  for (let index = start + 1; index < tokens.length; index += 1) {
    if (tokens[index].type === closeType && tokens[index].level === open.level) return index + 1;
  }
  return tokens.length;
}

function countListItems(tokens: Token[]) {
  return tokens.filter((token) => token.type === "list_item_open").length;
}

function threatStatus(content: string) {
  const value = normalizeThreatLabel(content).replace(/^\*+|\*+$/g, "");
  const match = /^(new|updated|ongoing|resolved|immediate|today|monitor|新增|更新|持续|已解决|立即|今日|监控|新規|継続|解決|至急|本日|監視)(?=:|\*|\s|$)/.exec(
    value
  );
  if (!match) return undefined;
  const statusMap: Record<string, string> = {
    new: "new",
    updated: "updated",
    ongoing: "ongoing",
    resolved: "resolved",
    immediate: "immediate",
    today: "today",
    monitor: "monitor",
    新增: "new",
    更新: "updated",
    持续: "ongoing",
    已解决: "resolved",
    立即: "immediate",
    今日: "today",
    监控: "monitor",
    新規: "new",
    継続: "ongoing",
    解決: "resolved",
    至急: "immediate",
    本日: "today",
    監視: "monitor"
  };
  return statusMap[match[1]];
}

function normalizeThreatLabel(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[：:]+$/u, "")
    .replace(/\s+/g, " ");
}

function cloneToken(token: Token) {
  const copy = Object.assign(Object.create(Object.getPrototypeOf(token)), token) as Token;
  copy.attrs = token.attrs?.map(([name, value]) => [name, value] as [string, string]) ?? null;
  copy.children = token.children?.map((child) => cloneToken(child)) ?? null;
  return copy;
}

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
