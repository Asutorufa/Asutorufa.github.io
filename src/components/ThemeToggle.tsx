import { useEffect, useState } from "react";
import type { UiLabels } from "../types/content";
import { Icon, type IconName } from "./Icon";

type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "asutorufa-theme";

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

  useEffect(() => {
    const saved = readSavedTheme();
    setMode(saved);
    applyTheme(saved);

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
    <div className="theme-toggle" aria-label={labels.themeLabel}>
      {MODES.map((item) => (
        <button
          key={item.value}
          type="button"
          className={item.value === mode ? "is-active" : ""}
          aria-pressed={item.value === mode}
          title={labels[item.labelKey]}
          onClick={() => selectTheme(item.value)}
        >
          <Icon name={item.icon} />
          <span>{labels[item.labelKey]}</span>
        </button>
      ))}
    </div>
  );
}

function readSavedTheme(): ThemeMode {
  let value: string | null = null;
  try {
    value = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    value = null;
  }
  if (value === "light" || value === "dark" || value === "system") return value;
  return "system";
}

function applyTheme(mode: ThemeMode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark-mode", dark);
  document.documentElement.classList.toggle("light-mode", !dark);
  document.documentElement.dataset.themePreference = mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#1f1f1f" : "#FFF0F5");
  window.dispatchEvent(new CustomEvent("asutorufa-theme-change", { detail: { mode, dark } }));
}
