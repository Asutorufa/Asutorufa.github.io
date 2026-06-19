import { useEffect, useMemo, useState } from "react";
import "./prism-manual";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import { Icon } from "../components/Icon";
import type { UiLabels } from "../types/content";
import { toolLabels } from "./shared";

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
    <section className="tool-panel">
      <div className="tool-panel-heading">
        <span className="tools-brace-icon" aria-hidden="true">
          {"{}"}
        </span>
        <h2>{labels.jsonFormatter}</h2>
      </div>

      <div className="json-tool-layout">
        <label className="tool-field">
          <span>{text.jsonInput}</span>
          <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder='{"hello":"world"}' spellCheck={false} />
        </label>
        <label className="tool-field">
          <span>{text.jsonOutput}</span>
          {output ? (
            <pre className="json-highlight-output language-json" aria-label={text.jsonOutput}>
              <code className="language-json" dangerouslySetInnerHTML={{ __html: highlightedOutput }} />
            </pre>
          ) : (
            <textarea value={output} readOnly placeholder={text.formattedResult} spellCheck={false} />
          )}
        </label>
      </div>

      {error ? <p className="tool-error">{error}</p> : null}

      <div className="tool-footer-actions">
        <label className="tool-inline-select">
          <span>{text.indent}</span>
          <select value={indent} onChange={(event) => setIndent(event.target.value)}>
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="tab">Tab</option>
          </select>
        </label>
        <button type="button" className="tool-primary-button" onClick={() => formatJson(false)}>
          {text.format}
        </button>
        <button type="button" className="tool-secondary-button" onClick={() => formatJson(true)}>
          {text.minify}
        </button>
        <button type="button" className="tool-secondary-button" onClick={copyOutput} disabled={!output}>
          <Icon name={copied ? "check" : "copy"} />
          {copied ? text.copied : text.copy}
        </button>
        <button
          type="button"
          className="tool-ghost-button"
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

      <div className="json-history">
        <div className="json-history-header">
          <h3>{text.history}</h3>
          {history.length ? (
            <button type="button" onClick={clearHistory}>
              {text.clearHistory}
            </button>
          ) : null}
        </div>
        {history.length ? (
          <ol className="json-history-list">
            {history.map((item) => (
              <li key={item.id}>
                <button type="button" className="json-history-item" onClick={() => restoreHistory(item)}>
                  <span className="json-history-title">{historyTitle(item.output)}</span>
                  <span className="json-history-meta">
                    {formatHistoryTime(item.createdAt)} · {item.compact ? text.minified : `${text.indent} ${item.indent === "tab" ? "Tab" : item.indent}`}
                  </span>
                </button>
                <button type="button" className="json-history-delete" onClick={() => removeHistoryItem(item.id)} aria-label={text.deleteHistory}>
                  <Icon name="trash" />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="json-history-empty">{text.noHistory}</p>
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
