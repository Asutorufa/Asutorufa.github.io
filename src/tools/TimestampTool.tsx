import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MotionPresets } from "../animation/motion-presets";
import { Icon } from "../components/Icon";
import type { UiLabels } from "../types/content";
import { formatLocalDateTime, parseLocalDateTime } from "./date-time";
import { LocalDateTimePicker } from "./LocalDateTimePicker";
import { OutputItem, toolLabels } from "./shared";
import { TOOL_CLASS, toolButton } from "./toolStyles";

type TimestampMode = "auto" | "seconds" | "milliseconds";

export function TimestampTool({ labels }: { labels: UiLabels }) {
  const text = toolLabels(labels);
  const [timestampInput, setTimestampInput] = useState("");
  const [timestampMode, setTimestampMode] = useState<TimestampMode>("auto");
  const [dateInput, setDateInput] = useState("");
  const [error, setError] = useState("");
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const now = new Date();
    syncFromDate(now);
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
    setDateInput(formatLocalDateTime(result.date));
    setError("");
  }

  function syncFromDate(date: Date) {
    setDateInput(formatLocalDateTime(date));
    setTimestampInput(String(Math.floor(date.getTime() / 1000)));
    setError("");
  }

  function handleDateInput(value: string) {
    setDateInput(value);
    const nextDate = parseLocalDateTime(value);
    if (!value || !nextDate) {
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
          <input
            className={TOOL_CLASS.control}
            value={timestampInput}
            onChange={(event) => syncFromTimestamp(event.target.value)}
            inputMode="numeric"
            placeholder="1755854433"
          />
        </label>

        <div className={TOOL_CLASS.field}>
          <span className={TOOL_CLASS.fieldLabel}>{text.unit}</span>
          <div className={TOOL_CLASS.segmented}>
            {(["auto", "seconds", "milliseconds"] as const).map((mode) => {
              const active = timestampMode === mode;
              return (
                <motion.button
                  key={mode}
                  type="button"
                  className={clsx(TOOL_CLASS.segmentedButton, active && TOOL_CLASS.segmentedButtonActive)}
                  onClick={() => handleMode(mode)}
                  whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.97, y: 0 }}
                  transition={MotionPresets.fast}
                >
                  {active ? (
                    <motion.span className={TOOL_CLASS.segmentedIndicator} layoutId="timestamp-unit-indicator" transition={MotionPresets.spring} />
                  ) : null}
                  <span className={TOOL_CLASS.segmentedContent}>{text[mode]}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <label className={TOOL_CLASS.field}>
          <span className={TOOL_CLASS.fieldLabel}>{text.localTime}</span>
          <LocalDateTimePicker labels={text} locale={text.dateLocale} value={dateInput} onChange={handleDateInput} />
        </label>

        <div className={TOOL_CLASS.actions}>
          <motion.button
            type="button"
            className={toolButton("primary")}
            onClick={() => syncFromDate(new Date())}
            whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { y: 0, scale: 0.96 }}
            transition={MotionPresets.fast}
          >
            {text.now}
          </motion.button>
        </div>
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

      <motion.div className={TOOL_CLASS.outputGrid} layout transition={MotionPresets.fast}>
        <OutputItem label={text.unixSeconds} value={validOutputDate ? String(Math.floor(validOutputDate.getTime() / 1000)) : ""} />
        <OutputItem label={text.unixMilliseconds} value={validOutputDate ? String(validOutputDate.getTime()) : ""} />
        <OutputItem label={text.isoTime} value={validOutputDate ? validOutputDate.toISOString() : ""} />
        <OutputItem label={text.utcTime} value={validOutputDate ? validOutputDate.toUTCString() : ""} />
      </motion.div>
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
