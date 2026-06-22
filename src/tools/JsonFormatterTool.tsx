import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import "./prism-manual";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import { Icon } from "../components/Icon";
import type { UiLabels } from "../types/content";
import { toolLabels } from "./shared";
import { TOOL_CLASS, toolButton } from "./toolStyles";

type JsonHistoryItem = {
  id: string;
  input: string;
  output: string;
  indent: string;
  compact: boolean;
  createdAt: number;
};

const JSON_HISTORY_STORAGE_KEY = "asutorufa-tools-json-history";
const JSON_HISTORY_LIMIT = 20;

const JSON_HISTORY_CLASS = {
  root: "mt-[1.2rem] border-t border-blog-border-muted pt-4",
  header: "mb-[0.7rem] flex items-center justify-between gap-4 max-md:flex-col max-md:items-start max-md:gap-[0.4rem]",
  heading: "m-0 text-[0.95rem] font-medium leading-[1.5] text-blog-text",
  clearButton:
    "rounded-full px-2.5 py-1 text-[0.78rem] leading-[1.4] text-blog-faint transition-colors duration-[180ms] hover:bg-blog-accent-softer hover:text-blog-accent",
  list: "m-0 grid list-none gap-[0.45rem] p-0",
  row:
    "flex min-w-0 items-center gap-[0.4rem] rounded-xl border border-blog-border-muted bg-blog-surface-muted p-[0.35rem] transition-[background-color,border-color,transform] duration-[180ms] hover:-translate-y-px hover:border-[var(--blog-accent-ring)] hover:bg-blog-surface",
  item: "flex min-w-0 flex-1 flex-col gap-[0.16rem] px-[0.45rem] py-[0.35rem] text-left",
  title: "overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[0.78rem] leading-[1.45] text-blog-heading",
  meta: "text-[0.74rem] leading-[1.5] text-blog-faint",
  delete:
    "inline-flex h-8 w-8 items-center justify-center rounded-full text-blog-faint transition-[background-color,color,transform] duration-[180ms] hover:bg-[#fff0f0] hover:text-[#c4352c] active:scale-[0.94]",
  empty: "m-0 rounded-xl border border-dashed border-blog-border bg-blog-surface-muted px-[0.85rem] py-3 text-[0.74rem] leading-[1.5] text-blog-faint"
};

const JSON_PREVIEW_STYLES = `
.json-highlight-output code {
  background: transparent;
  display: block;
  min-width: max-content;
}

.json-highlight-output .token.property {
  color: #0550ae;
}

.json-highlight-output .token.string {
  color: #0a3069;
}

.json-highlight-output .token.number,
.json-highlight-output .token.boolean,
.json-highlight-output .token.null {
  color: #953800;
}

.json-highlight-output .token.punctuation {
  color: #57606a;
}

html.dark-mode .json-highlight-output {
  background: #0d1117;
  color: #c9d1d9;
  scrollbar-color: #44505f transparent;
}

html.dark-mode .json-highlight-output::-webkit-scrollbar-thumb {
  background: #44505f;
}

html.dark-mode .json-highlight-output::-webkit-scrollbar-thumb:hover {
  background: #5e6b7c;
}

html.dark-mode .json-highlight-output .token.property {
  color: #79c0ff;
}

html.dark-mode .json-highlight-output .token.string {
  color: #a5d6ff;
}

html.dark-mode .json-highlight-output .token.number,
html.dark-mode .json-highlight-output .token.boolean,
html.dark-mode .json-highlight-output .token.null {
  color: #ffa657;
}

html.dark-mode .json-highlight-output .token.punctuation {
  color: #8b949e;
}
`;

export function JsonFormatterTool({ labels }: { labels: UiLabels }) {
  const text = toolLabels(labels);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState("2");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<JsonHistoryItem[]>([]);
  const highlightedOutput = useMemo(() => highlightJson(output), [output]);

  useEffect(() => {
    setHistory(readJsonHistory());
  }, []);

  function formatJson(compact = false) {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const nextOutput = JSON.stringify(parsed, null, compact ? 0 : indent === "tab" ? "\t" : Number(indent));
      setOutput(nextOutput);
      setError("");
      const nextHistory = addJsonHistoryItem(history, {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        input,
        output: nextOutput,
        indent,
        compact,
        createdAt: Date.now()
      });
      setHistory(nextHistory);
      writeJsonHistory(nextHistory);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : text.invalidJson);
      setOutput("");
    }
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard?.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function restoreHistory(item: JsonHistoryItem) {
    setInput(item.input);
    setOutput(item.output);
    setIndent(item.indent);
    setError("");
  }

  function removeHistoryItem(id: string) {
    const nextHistory = history.filter((item) => item.id !== id);
    setHistory(nextHistory);
    writeJsonHistory(nextHistory);
  }

  function clearHistory() {
    setHistory([]);
    writeJsonHistory([]);
  }

  return (
    <section className={TOOL_CLASS.panel}>
      <style>{JSON_PREVIEW_STYLES}</style>
      <div className={TOOL_CLASS.heading}>
        <span className={TOOL_CLASS.braceIcon} aria-hidden="true">
          {"{}"}
        </span>
        <h2 className={TOOL_CLASS.headingTitle}>{labels.jsonFormatter}</h2>
      </div>

      <div className={TOOL_CLASS.jsonLayout}>
        <label className={TOOL_CLASS.field}>
          <span className={TOOL_CLASS.fieldLabel}>{text.jsonInput}</span>
          <textarea className={clsx(TOOL_CLASS.control, TOOL_CLASS.textarea, TOOL_CLASS.monoTextarea)} value={input} onChange={(event) => setInput(event.target.value)} placeholder='{"hello":"world"}' spellCheck={false} />
        </label>
        <label className={TOOL_CLASS.field}>
          <span className={TOOL_CLASS.fieldLabel}>{text.jsonOutput}</span>
          {output ? (
            <pre className={clsx(TOOL_CLASS.jsonPreview, "language-json")} aria-label={text.jsonOutput}>
              <code className="language-json" dangerouslySetInnerHTML={{ __html: highlightedOutput }} />
            </pre>
          ) : (
            <textarea className={clsx(TOOL_CLASS.control, TOOL_CLASS.textarea)} value={output} readOnly placeholder={text.formattedResult} spellCheck={false} />
          )}
        </label>
      </div>

      {error ? <p className={TOOL_CLASS.error}>{error}</p> : null}

      <div className={TOOL_CLASS.footerActions}>
        <label className={TOOL_CLASS.inlineSelect}>
          <span className={TOOL_CLASS.fieldLabel}>{text.indent}</span>
          <select className={clsx(TOOL_CLASS.control, TOOL_CLASS.select)} value={indent} onChange={(event) => setIndent(event.target.value)}>
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="tab">Tab</option>
          </select>
        </label>
        <button type="button" className={toolButton("primary", TOOL_CLASS.footerButton)} onClick={() => formatJson(false)}>
          {text.format}
        </button>
        <button type="button" className={toolButton("secondary", TOOL_CLASS.footerButton)} onClick={() => formatJson(true)}>
          {text.minify}
        </button>
        <button type="button" className={toolButton("secondary", TOOL_CLASS.footerButton)} onClick={copyOutput} disabled={!output}>
          <Icon name={copied ? "check" : "copy"} />
          {copied ? text.copied : text.copy}
        </button>
        <button
          type="button"
          className={toolButton("ghost", TOOL_CLASS.footerButton)}
          onClick={() => {
            setInput("");
            setOutput("");
            setError("");
          }}
        >
          <Icon name="trash" />
          {text.clear}
        </button>
      </div>

      <div className={JSON_HISTORY_CLASS.root}>
        <div className={JSON_HISTORY_CLASS.header}>
          <h3 className={JSON_HISTORY_CLASS.heading}>{text.history}</h3>
          {history.length ? (
            <button type="button" className={JSON_HISTORY_CLASS.clearButton} onClick={clearHistory}>
              {text.clearHistory}
            </button>
          ) : null}
        </div>
        {history.length ? (
          <ol className={JSON_HISTORY_CLASS.list}>
            {history.map((item) => (
              <li key={item.id} className={JSON_HISTORY_CLASS.row}>
                <button type="button" className={JSON_HISTORY_CLASS.item} onClick={() => restoreHistory(item)}>
                  <span className={JSON_HISTORY_CLASS.title}>{historyTitle(item.output)}</span>
                  <span className={JSON_HISTORY_CLASS.meta}>
                    {formatHistoryTime(item.createdAt)} · {item.compact ? text.minified : `${text.indent} ${item.indent === "tab" ? "Tab" : item.indent}`}
                  </span>
                </button>
                <button type="button" className={JSON_HISTORY_CLASS.delete} onClick={() => removeHistoryItem(item.id)} aria-label={text.deleteHistory}>
                  <Icon name="trash" />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className={JSON_HISTORY_CLASS.empty}>{text.noHistory}</p>
        )}
      </div>
    </section>
  );
}

function readJsonHistory(): JsonHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(JSON_HISTORY_STORAGE_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isJsonHistoryItem).slice(0, JSON_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function writeJsonHistory(history: JsonHistoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(JSON_HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, JSON_HISTORY_LIMIT)));
  } catch {
    // Ignore storage quota or private browsing failures.
  }
}

function addJsonHistoryItem(history: JsonHistoryItem[], item: JsonHistoryItem) {
  return [item, ...history.filter((entry) => entry.input !== item.input || entry.output !== item.output)].slice(0, JSON_HISTORY_LIMIT);
}

function isJsonHistoryItem(value: unknown): value is JsonHistoryItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<JsonHistoryItem>;
  return (
    typeof item.id === "string" &&
    typeof item.input === "string" &&
    typeof item.output === "string" &&
    typeof item.indent === "string" &&
    typeof item.compact === "boolean" &&
    typeof item.createdAt === "number"
  );
}

function historyTitle(output: string) {
  const compact = output.replace(/\s+/g, " ").trim();
  return compact.length > 86 ? `${compact.slice(0, 86)}...` : compact || "{}";
}

function formatHistoryTime(value: number) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

function highlightJson(value: string) {
  if (!value) return "";
  try {
    return Prism.highlight(value, Prism.languages.json, "json");
  } catch {
    return escapeHtml(value);
  }
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
