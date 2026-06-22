import clsx from "clsx";
import { useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { MotionPresets } from "../animation/motion-presets";
import type { UiLabels } from "../types/content";
import { Icon, type IconName } from "./Icon";
import styles from "./ThemeToggle.module.css";

type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "asutorufa-theme";
const THEME_COLOR_LIGHT = "#f7f7f7";
const THEME_COLOR_DARK = "#282828";

type ThemeToggleProps = {
  labels: UiLabels;
};

const MODES: Array<{ value: ThemeMode; icon: IconName; labelKey: "themeSystem" | "themeLight" | "themeDark" }> = [
  { value: "system", icon: "desktop", labelKey: "themeSystem" },
  { value: "light", icon: "sun", labelKey: "themeLight" },
  { value: "dark", icon: "moon", labelKey: "themeDark" }
];

export function ThemeToggle({ labels }: ThemeToggleProps) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const indicatorId = useId();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const saved = readSavedTheme();
    setMode(saved);
    applyTheme(saved, { animate: false });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readSavedTheme() === "system") applyTheme("system");
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  const selectTheme = (nextMode: ThemeMode) => {
    setMode(nextMode);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      // Ignore storage failures; the current page can still apply the selected theme.
    }
    applyTheme(nextMode);
  };

  return (
    <div className={styles.root} aria-label={labels.themeLabel}>
      {MODES.map((item) => (
        <motion.button
          key={item.value}
          type="button"
          className={clsx(styles.button, item.value === mode && styles.active)}
          aria-pressed={item.value === mode}
          title={labels[item.labelKey]}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          transition={MotionPresets.fast}
          onClick={() => selectTheme(item.value)}
        >
          {item.value === mode ? (
            <motion.span className={styles.indicator} layoutId={`theme-toggle-indicator-${indicatorId}`} transition={MotionPresets.spring} />
          ) : null}
          <Icon name={item.icon} />
          <span className={styles.label}>{labels[item.labelKey]}</span>
        </motion.button>
      ))}
    </div>
  );
}

function readSavedTheme(): ThemeMode {
  let value: string | null = null;
  try {
    value = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Ignore storage access failures and fall back to system theme.
  }
  if (value === "light" || value === "dark" || value === "system") return value;
  return "system";
}

function applyTheme(mode: ThemeMode, options: { animate?: boolean } = {}) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const themeColor = dark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
  const update = () => {
    document.documentElement.classList.toggle("dark-mode", dark);
    document.documentElement.classList.toggle("light-mode", !dark);
    document.documentElement.dataset.themePreference = mode;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", readThemeColor(themeColor));
    window.dispatchEvent(new CustomEvent("asutorufa-theme-change", { detail: { mode, dark } }));
  };

  if (options.animate === false) {
    update();
    return;
  }

  update();
}

function readThemeColor(fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--blog-theme-color").trim();
  return value || fallback;
}
