import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import type { UiLabels } from "../types/content";
import { OutputItem, toolLabels } from "./shared";
import { TOOL_CLASS, toolButton } from "./toolStyles";

type TimestampMode = "auto" | "seconds" | "milliseconds";

export function TimestampTool({ labels }: { labels: UiLabels }) {
  const text = toolLabels(labels);
  const [timestampInput, setTimestampInput] = useState("");
  const [timestampMode, setTimestampMode] = useState<TimestampMode>("auto");
  const [dateInput, setDateInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const now = new Date();
    syncFromDate(now);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parsedDate = useMemo(() => parseTimestamp(timestampInput, timestampMode), [timestampInput, timestampMode]);
  const validOutputDate = parsedDate.ok ? parsedDate.date : undefined;

  function syncFromTimestamp(value: string, mode = timestampMode) {
    setTimestampInput(value);
    const result = parseTimestamp(value, mode);
    if (!value.trim()) {
      setError("");
      return;
    }
    if (!result.ok) {
      setError(text.invalidTimestamp);
      return;
    }
    setDateInput(formatLocalInput(result.date));
    setError("");
  }

  function syncFromDate(date: Date) {
    setDateInput(formatLocalInput(date));
    setTimestampInput(String(Math.floor(date.getTime() / 1000)));
    setError("");
  }

  function handleDateInput(value: string) {
    setDateInput(value);
    const nextDate = new Date(value);
    if (!value || Number.isNaN(nextDate.getTime())) {
      setError(value ? text.invalidDate : "");
      return;
    }
    setTimestampInput(String(Math.floor(nextDate.getTime() / 1000)));
    setError("");
  }

  function handleMode(mode: TimestampMode) {
    setTimestampMode(mode);
    syncFromTimestamp(timestampInput, mode);
  }

  return (
    <section className={TOOL_CLASS.panel}>
      <div className={TOOL_CLASS.heading}>
        <Icon name="clock" />
        <h2 className={TOOL_CLASS.headingTitle}>{labels.unixTimestamp}</h2>
      </div>

      <div className={TOOL_CLASS.grid}>
        <label className={TOOL_CLASS.field}>
          <span className={TOOL_CLASS.fieldLabel}>{text.timestamp}</span>
          <input className={TOOL_CLASS.control} value={timestampInput} onChange={(event) => syncFromTimestamp(event.target.value)} inputMode="numeric" placeholder="1755854433" />
        </label>

        <div className={TOOL_CLASS.field}>
          <span className={TOOL_CLASS.fieldLabel}>{text.unit}</span>
          <div className={TOOL_CLASS.segmented}>
            {(["auto", "seconds", "milliseconds"] as const).map((mode) => (
              <button key={mode} type="button" className={clsx(TOOL_CLASS.segmentedButton, timestampMode === mode && TOOL_CLASS.segmentedButtonActive)} onClick={() => handleMode(mode)}>
                {text[mode]}
              </button>
            ))}
          </div>
        </div>

        <label className={TOOL_CLASS.field}>
          <span className={TOOL_CLASS.fieldLabel}>{text.localTime}</span>
          <input className={TOOL_CLASS.control} type="datetime-local" step="1" value={dateInput} onChange={(event) => handleDateInput(event.target.value)} />
        </label>

        <div className={TOOL_CLASS.actions}>
          <button type="button" className={toolButton("primary")} onClick={() => syncFromDate(new Date())}>
            {text.now}
          </button>
        </div>
      </div>

      {error ? <p className={TOOL_CLASS.error}>{error}</p> : null}

      <div className={TOOL_CLASS.outputGrid}>
        <OutputItem label={text.unixSeconds} value={validOutputDate ? String(Math.floor(validOutputDate.getTime() / 1000)) : ""} />
        <OutputItem label={text.unixMilliseconds} value={validOutputDate ? String(validOutputDate.getTime()) : ""} />
        <OutputItem label={text.isoTime} value={validOutputDate ? validOutputDate.toISOString() : ""} />
        <OutputItem label={text.utcTime} value={validOutputDate ? validOutputDate.toUTCString() : ""} />
      </div>
    </section>
  );
}

function parseTimestamp(value: string, mode: TimestampMode): { ok: true; date: Date } | { ok: false } {
  const trimmed = value.trim();
  if (!trimmed || !/^-?\d+(?:\.\d+)?$/.test(trimmed)) return { ok: false };
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) return { ok: false };
  const milliseconds = mode === "milliseconds" || (mode === "auto" && Math.abs(numeric) >= 100000000000) ? numeric : numeric * 1000;
  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime()) ? { ok: false } : { ok: true, date };
}

function formatLocalInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
