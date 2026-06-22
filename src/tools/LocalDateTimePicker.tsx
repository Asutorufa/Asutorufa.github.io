import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MotionPresets } from "../animation/motion-presets";
import { Icon } from "../components/Icon";
import type { ToolLabels } from "./shared";
import { TOOL_CLASS } from "./toolStyles";
import { formatLocalDateTime, parseLocalDateTime } from "./date-time";

type LocalDateTimePickerProps = {
  labels: ToolLabels;
  locale: string;
  onChange: (value: string) => void;
  value: string;
};

type TimePart = "hour" | "minute" | "second";

const timeParts: Array<{ key: TimePart; max: number; min: number }> = [
  { key: "hour", min: 0, max: 23 },
  { key: "minute", min: 0, max: 59 },
  { key: "second", min: 0, max: 59 }
];

export function LocalDateTimePicker({ labels, locale, onChange, value }: LocalDateTimePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => parseLocalDateTime(value) ?? new Date(), [value]);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selectedDate));
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    setVisibleMonth(startOfMonth(selectedDate));
  }, [open, selectedDate]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  const monthTitle = useMemo(() => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(visibleMonth), [locale, visibleMonth]);
  const weekdays = useMemo(() => weekdayLabels(locale), [locale]);
  const days = useMemo(() => monthCells(visibleMonth), [visibleMonth]);

  const updateDate = (nextDate: Date) => {
    onChange(formatLocalDateTime(nextDate));
  };

  const selectDay = (date: Date) => {
    const nextDate = new Date(date);
    nextDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), selectedDate.getSeconds(), 0);
    updateDate(nextDate);
    setVisibleMonth(startOfMonth(nextDate));
  };

  const shiftMonth = (amount: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const shiftTime = (part: TimePart, amount: number) => {
    const nextDate = new Date(selectedDate);
    if (part === "hour") nextDate.setHours(wrap(nextDate.getHours() + amount, 0, 23));
    if (part === "minute") nextDate.setMinutes(wrap(nextDate.getMinutes() + amount, 0, 59));
    if (part === "second") nextDate.setSeconds(wrap(nextDate.getSeconds() + amount, 0, 59));
    updateDate(nextDate);
  };

  const selectNow = () => {
    const now = new Date();
    updateDate(now);
    setVisibleMonth(startOfMonth(now));
  };

  const timeValue = (part: TimePart) => {
    if (part === "hour") return selectedDate.getHours();
    if (part === "minute") return selectedDate.getMinutes();
    return selectedDate.getSeconds();
  };

  const timeLabel = (part: TimePart) => {
    if (part === "hour") return labels.hour;
    if (part === "minute") return labels.minute;
    return labels.second;
  };

  return (
    <div className={TOOL_CLASS.dateTimePicker} ref={rootRef}>
      <div className={TOOL_CLASS.dateTimeControl}>
        <input
          className={TOOL_CLASS.dateTimeInput}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "ArrowDown") setOpen(true);
          }}
          inputMode="numeric"
          placeholder="2026-06-22 17:53:21"
          autoComplete="off"
        />
        <motion.button
          type="button"
          className={TOOL_CLASS.dateTimeToggle}
          onClick={() => setOpen((current) => !current)}
          aria-label={labels.openCalendar}
          aria-expanded={open}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
          transition={MotionPresets.fast}
        >
          <Icon name="calendar" />
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            className={TOOL_CLASS.datePickerPopover}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -4 }}
            transition={MotionPresets.fast}
          >
            <div className={TOOL_CLASS.datePickerBody}>
              <div className={TOOL_CLASS.datePickerCalendar}>
                <div className={TOOL_CLASS.datePickerHeader}>
                  <button type="button" className={TOOL_CLASS.datePickerNav} onClick={() => shiftMonth(-1)} aria-label={labels.previousMonth}>
                    <Icon name="chevron-left" />
                  </button>
                  <p className={TOOL_CLASS.datePickerTitle}>{monthTitle}</p>
                  <button type="button" className={TOOL_CLASS.datePickerNav} onClick={() => shiftMonth(1)} aria-label={labels.nextMonth}>
                    <Icon name="chevron-right" />
                  </button>
                </div>

                <div className={TOOL_CLASS.datePickerGrid}>
                  {weekdays.map((weekday) => (
                    <span className={TOOL_CLASS.datePickerWeekday} key={weekday}>
                      {weekday}
                    </span>
                  ))}
                  {days.map((day) => {
                    const selected = isSameDay(day.date, selectedDate);
                    const today = isSameDay(day.date, new Date());
                    return (
                      <motion.button
                        key={day.date.toISOString()}
                        type="button"
                        className={clsx(
                          TOOL_CLASS.datePickerDay,
                          !day.currentMonth && TOOL_CLASS.datePickerDayMuted,
                          today && TOOL_CLASS.datePickerDayToday,
                          selected && TOOL_CLASS.datePickerDaySelected
                        )}
                        onClick={() => selectDay(day.date)}
                        whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.92, y: 0 }}
                        transition={MotionPresets.fast}
                      >
                        {day.date.getDate()}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className={TOOL_CLASS.timePanel}>
                {timeParts.map((part) => (
                  <div className={TOOL_CLASS.timeColumn} key={part.key}>
                    <span className={TOOL_CLASS.timeLabel}>{timeLabel(part.key)}</span>
                    <button type="button" className={TOOL_CLASS.timeStepper} onClick={() => shiftTime(part.key, 1)} aria-label={`${timeLabel(part.key)} +`}>
                      <Icon name="chevron-up" />
                    </button>
                    <span className={TOOL_CLASS.timeValue}>{String(timeValue(part.key)).padStart(2, "0")}</span>
                    <button type="button" className={TOOL_CLASS.timeStepper} onClick={() => shiftTime(part.key, -1)} aria-label={`${timeLabel(part.key)} -`}>
                      <Icon name="chevron-down" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={TOOL_CLASS.datePickerActions}>
              <button type="button" className={TOOL_CLASS.datePickerAction} onClick={selectNow}>
                {labels.today}
              </button>
              <button type="button" className={TOOL_CLASS.datePickerAction} onClick={() => setOpen(false)}>
                {labels.closeCalendar}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthCells(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, monthIndex, index - firstDay + 1);
    return {
      currentMonth: date.getMonth() === monthIndex,
      date
    };
  });
}

function weekdayLabels(locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const start = new Date(2024, 0, 7);
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)));
}

function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function wrap(value: number, min: number, max: number) {
  if (value > max) return min;
  if (value < min) return max;
  return value;
}
