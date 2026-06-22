import clsx from "clsx";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
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

const timeParts: TimePart[] = ["hour", "minute", "second"];
const hourSteps = [0, 6, 12, 18];
const minuteSecondSteps = [0, 15, 30, 45];

export function LocalDateTimePicker({ labels, locale, onChange, value }: LocalDateTimePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const pickerId = useId();
  const [open, setOpen] = useState(false);
  const [activeTimePart, setActiveTimePart] = useState<TimePart>("hour");
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

  const normalizeInput = () => {
    const date = parseLocalDateTime(value);
    if (date) updateDate(date);
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

  const selectTime = (part: TimePart, nextValue: number) => {
    const nextDate = new Date(selectedDate);
    if (part === "hour") nextDate.setHours(nextValue);
    if (part === "minute") nextDate.setMinutes(nextValue);
    if (part === "second") nextDate.setSeconds(nextValue);
    updateDate(nextDate);
  };

  const selectTimeFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const clock = clockRef.current;
    if (!clock) return;

    const rect = clock.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    const angle = (Math.atan2(y, x) * 180) / Math.PI;
    const clockwiseAngle = (angle + 90 + 360) % 360;

    if (activeTimePart === "hour") {
      selectTime(activeTimePart, Math.round(clockwiseAngle / 15) % 24);
      return;
    }

    selectTime(activeTimePart, Math.round(clockwiseAngle / 6) % 60);
  };

  const startClockDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    selectTimeFromPointer(event);
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
  const activeTimeValue = timeValue(activeTimePart);
  const clockOptions = timeOptions(activeTimePart, activeTimeValue);
  const clockHand = handStyle(activeTimePart, activeTimeValue);
  const monthKey = `${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`;

  return (
    <div className={TOOL_CLASS.dateTimePicker} ref={rootRef}>
      <div className={TOOL_CLASS.dateTimeControl}>
        <input
          className={TOOL_CLASS.dateTimeInput}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => {
            normalizeInput();
            setOpen(true);
          }}
          onBlur={normalizeInput}
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
          onClick={() => {
            normalizeInput();
            setOpen((current) => !current);
          }}
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

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={monthKey}
                    className={TOOL_CLASS.datePickerGrid}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={MotionPresets.fast}
                  >
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
                          {selected ? (
                            <motion.span
                              className={TOOL_CLASS.datePickerDayIndicator}
                              layoutId={`date-picker-day-${pickerId}`}
                              transition={MotionPresets.spring}
                            />
                          ) : null}
                          <span className={TOOL_CLASS.datePickerDayText}>{day.date.getDate()}</span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className={TOOL_CLASS.timePanel}>
                <div className={TOOL_CLASS.timeDisplay} aria-label={`${timeValue("hour")}:${timeValue("minute")}:${timeValue("second")}`}>
                  {timeParts.map((part, index) => (
                    <span key={part} className={clsx(TOOL_CLASS.timeDisplayPart, activeTimePart === part && TOOL_CLASS.timeDisplayPartActive)}>
                      {index > 0 ? <span className={TOOL_CLASS.timeDisplaySeparator}>:</span> : null}
                      {String(timeValue(part)).padStart(2, "0")}
                    </span>
                  ))}
                </div>
                <div className={TOOL_CLASS.timeTabs}>
                  {timeParts.map((part) => {
                    const active = activeTimePart === part;
                    return (
                      <button
                        key={part}
                        type="button"
                        className={clsx(TOOL_CLASS.timeTab, active && TOOL_CLASS.timeTabActive)}
                        onClick={() => setActiveTimePart(part)}
                      >
                        {active ? (
                          <motion.span
                            className={TOOL_CLASS.timeTabIndicator}
                            layoutId={`date-picker-time-tab-${pickerId}`}
                            transition={MotionPresets.spring}
                          />
                        ) : null}
                        <span className={TOOL_CLASS.timeTabContent}>
                          <span className={TOOL_CLASS.timeTabLabel}>{timeLabel(part)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div
                  ref={clockRef}
                  className={TOOL_CLASS.clockFace}
                  onPointerDown={startClockDrag}
                  onPointerMove={(event) => {
                    if (event.buttons !== 1) return;
                    selectTimeFromPointer(event);
                  }}
                >
                  <div className={TOOL_CLASS.clockTicks} aria-hidden="true">
                    {clockTicks(activeTimePart).map((tick) => (
                      <span
                        key={`${activeTimePart}-tick-${tick.value}`}
                        className={clsx(TOOL_CLASS.clockTick, tick.major && TOOL_CLASS.clockTickMajor)}
                        style={tick.style}
                      />
                    ))}
                  </div>
                  <motion.span className={TOOL_CLASS.clockHand} style={clockHand} transition={MotionPresets.fast} />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeTimePart}
                      className={TOOL_CLASS.clockMarks}
                      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                      transition={MotionPresets.fast}
                    >
                      {clockOptions.map((option) => (
                        <motion.button
                          key={`${activeTimePart}-${option.value}`}
                          type="button"
                          className={clsx(TOOL_CLASS.clockValue, option.active && TOOL_CLASS.clockValueActive)}
                          style={option.style}
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={() => selectTime(activeTimePart, option.value)}
                          transition={MotionPresets.fast}
                        >
                          {String(option.value).padStart(2, "0")}
                        </motion.button>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
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

function timeOptions(part: TimePart, activeValue: number) {
  const values = part === "hour" ? hourSteps : minuteSecondSteps;
  return values.map((value) => ({
    active: value === activeValue,
    style: clockValueStyle(part, value),
    value
  }));
}

function clockValueStyle(part: TimePart, value: number) {
  const angle = part === "hour" ? value * 15 - 90 : value * 6 - 90;
  const radius = 4.15;
  return {
    "--clock-x": `${Math.cos((angle * Math.PI) / 180) * radius}rem`,
    "--clock-y": `${Math.sin((angle * Math.PI) / 180) * radius}rem`
  } as CSSProperties;
}

function handStyle(part: TimePart, value: number) {
  const angle = part === "hour" ? value * 15 : value * 6;
  const length = 4.05;
  return {
    "--clock-angle": `${angle}deg`,
    "--clock-hand-length": `${length}rem`
  } as CSSProperties;
}

function clockTicks(part: TimePart) {
  const count = part === "hour" ? 24 : 60;
  return Array.from({ length: count }, (_, value) => {
    const angle = part === "hour" ? value * 15 - 90 : value * 6 - 90;
    const radius = 5.05;
    return {
      major: part === "hour" ? value % 6 === 0 : value % 15 === 0,
      style: {
        "--clock-tick-angle": `${angle + 90}deg`,
        "--clock-x": `${Math.cos((angle * Math.PI) / 180) * radius}rem`,
        "--clock-y": `${Math.sin((angle * Math.PI) / 180) * radius}rem`
      } as CSSProperties,
      value
    };
  });
}
