import { useState } from "react";
import type { UiLabels } from "../types/content";
import { menuItems } from "../data/menu";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./Icon";

type MobileHeaderProps = {
  title: string;
  subtitle: string;
  labels: UiLabels;
  currentRoute: string;
};

export function MobileHeader({ title, subtitle, labels, currentRoute }: MobileHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="mb-2 overflow-hidden rounded-b-[22px] bg-white shadow-blog lg:hidden">
      <div className="relative px-5 py-10 text-center">
        <button
          type="button"
          className="absolute left-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded transition-colors hover:bg-[#fff0f8] active:bg-[#ffe0f3]"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={labels.menu}
        >
          <span className="flex w-8 flex-col gap-1.5">
            <span className="h-1 rounded bg-black" />
            <span className="h-1 rounded bg-black" />
            <span className="h-1 rounded bg-black" />
          </span>
        </button>
        <a href="/" className="block text-[20px] font-normal leading-9 text-[#222] transition-colors hover:text-[#ff5b25]">
          {title}
        </a>
        <p className="mt-2 text-[13px] font-normal leading-6 text-black">{subtitle}</p>
      </div>
      {open ? (
        <nav className="border-t border-neutral-200 py-2">
          {menuItems(labels).map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-8 py-3 text-[14px] font-normal leading-8 transition-colors active:bg-[#ffe0f3] ${
                isActive(currentRoute, item.href) ? "bg-[#ffc7eb] text-black" : "text-black hover:bg-[#fff0f8] hover:text-[#ff5b25]"
              }`}
            >
              <Icon name={item.icon} className="w-[1.28571429em] text-[16px]" />
              <span>{item.label}</span>
            </a>
          ))}
          <div className="px-8 py-3">
            <ThemeToggle labels={labels} />
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function isActive(route: string, href: string) {
  if (href === "/") return route === "/";
  return route.startsWith(href);
}
