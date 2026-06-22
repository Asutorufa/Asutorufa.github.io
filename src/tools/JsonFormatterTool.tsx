import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import "./prism-manual";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import { MotionPresets } from "../animation/motion-presets";
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

export function JsonFormatterTool({ labels }: { labels: UiLabels }) {
  const text = toolLabels(labels);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState("2");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<JsonHistoryItem[]>([]);
  const highlightedOutput = useMemo(() => highlightJson(output), [output]);
  const prefersReducedMotion = useReducedMotion();

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
      <div className={TOOL_CLASS.heading}>
        <span className={TOOL_CLASS.braceIcon} aria-hidden="true">
          {"{}"}
        </span>
        <h2 className={TOOL_CLASS.headingTitle}>{labels.jsonFormatter}</h2>
      </div>

      <div className={TOOL_CLASS.jsonLayout}>
        <label className={TOOL_CLASS.field}>
          <span className={TOOL_CLASS.fieldLabel}>{text.jsonInput}</span>
          <textarea
            className={clsx(TOOL_CLASS.control, TOOL_CLASS.textarea, TOOL_CLASS.monoTextarea)}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder='{"hello":"world"}'
            spellCheck={false}
          />
        </label>
        <label className={TOOL_CLASS.field}>
          <span className={TOOL_CLASS.fieldLabel}>{text.jsonOutput}</span>
          <div className={TOOL_CLASS.jsonOutputShell}>
            <AnimatePresence mode="wait" initial={false}>
              {output ? (
                <motion.pre
                  key="preview"
                  className={clsx(TOOL_CLASS.jsonPreview, "language-json")}
                  aria-label={text.jsonOutput}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={MotionPresets.fast}
                >
                  <code className="language-json" dangerouslySetInnerHTML={{ __html: highlightedOutput }} />
                </motion.pre>
              ) : (
                <motion.textarea
                  key="empty"
                  className={clsx(TOOL_CLASS.control, TOOL_CLASS.textarea)}
                  value={output}
                  readOnly
                  placeholder={text.formattedResult}
                  spellCheck={false}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={MotionPresets.fast}
                />
              )}
            </AnimatePresence>
          </div>
        </label>
      </div>

      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            className={TOOL_CLASS.error}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={MotionPresets.fast}
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <div className={TOOL_CLASS.footerActions}>
        <label className={TOOL_CLASS.inlineSelect}>
          <span className={TOOL_CLASS.fieldLabel}>{text.indent}</span>
          <select className={clsx(TOOL_CLASS.control, TOOL_CLASS.select)} value={indent} onChange={(event) => setIndent(event.target.value)}>
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="tab">Tab</option>
          </select>
        </label>
        <motion.button
          type="button"
          className={toolButton("primary", TOOL_CLASS.footerButton)}
          onClick={() => formatJson(false)}
          whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.02 }}
          whileTap={prefersReducedMotion ? undefined : { y: 0, scale: 0.96 }}
          transition={MotionPresets.fast}
        >
          {text.format}
        </motion.button>
        <motion.button
          type="button"
          className={toolButton("secondary", TOOL_CLASS.footerButton)}
          onClick={() => formatJson(true)}
          whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.02 }}
          whileTap={prefersReducedMotion ? undefined : { y: 0, scale: 0.96 }}
          transition={MotionPresets.fast}
        >
          {text.minify}
        </motion.button>
        <motion.button
          type="button"
          className={toolButton("secondary", TOOL_CLASS.footerButton)}
          onClick={copyOutput}
          disabled={!output}
          whileHover={prefersReducedMotion || !output ? undefined : { y: -1, scale: 1.02 }}
          whileTap={prefersReducedMotion || !output ? undefined : { y: 0, scale: 0.96 }}
          transition={MotionPresets.fast}
        >
          <Icon name={copied ? "check" : "copy"} />
          {copied ? text.copied : text.copy}
        </motion.button>
        <motion.button
          type="button"
          className={toolButton("ghost", TOOL_CLASS.footerButton)}
          whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.02 }}
          whileTap={prefersReducedMotion ? undefined : { y: 0, scale: 0.96 }}
          transition={MotionPresets.fast}
          onClick={() => {
            setInput("");
            setOutput("");
            setError("");
          }}
        >
          <Icon name="trash" />
          {text.clear}
        </motion.button>
      </div>

      <div className={TOOL_CLASS.jsonHistory}>
        <div className={TOOL_CLASS.jsonHistoryHeader}>
          <h3 className={TOOL_CLASS.jsonHistoryHeading}>{text.history}</h3>
          {history.length ? (
            <motion.button
              type="button"
              className={TOOL_CLASS.jsonHistoryClear}
              onClick={clearHistory}
              whileHover={prefersReducedMotion ? undefined : { y: -1 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.96, y: 0 }}
              transition={MotionPresets.fast}
            >
              {text.clearHistory}
            </motion.button>
          ) : null}
        </div>
        {history.length ? (
          <ol className={TOOL_CLASS.jsonHistoryList}>
            <AnimatePresence initial={false}>
              {history.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  className={TOOL_CLASS.jsonHistoryRow}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -2 }}
                  transition={MotionPresets.fast}
                >
                  <button type="button" className={TOOL_CLASS.jsonHistoryItem} onClick={() => restoreHistory(item)}>
                    <span className={TOOL_CLASS.jsonHistoryTitle}>{historyTitle(item.output)}</span>
                    <span className={TOOL_CLASS.jsonHistoryMeta}>
                      {formatHistoryTime(item.createdAt)} · {item.compact ? text.minified : `${text.indent} ${item.indent === "tab" ? "Tab" : item.indent}`}
                    </span>
                  </button>
                  <motion.button
                    type="button"
                    className={TOOL_CLASS.jsonHistoryDelete}
                    onClick={() => removeHistoryItem(item.id)}
                    aria-label={text.deleteHistory}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
                    transition={MotionPresets.fast}
                  >
                    <Icon name="trash" />
                  </motion.button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        ) : (
          <motion.p
            className={TOOL_CLASS.jsonHistoryEmpty}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={MotionPresets.fast}
          >
            {text.noHistory}
          </motion.p>
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
