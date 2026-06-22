import clsx from "clsx";
import { useEffect, useState } from "react";
import type { UiLabels } from "../types/content";
import { menuItems } from "../data/menu";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";

type MobileHeaderProps = {
  title: string;
  subtitle: string;
  labels: UiLabels;
  currentRoute: string;
};

const MOBILE_CLASS = {
  avatar: "h-[2.7rem] w-[2.7rem] rounded-full border border-blog-border-muted bg-blog-surface object-cover",
  backdrop: "absolute inset-0 cursor-pointer appearance-none border-0 bg-[var(--blog-mobile-backdrop)] opacity-0 transition-opacity duration-200",
  backdropOpen: "opacity-100",
  brand: "flex min-w-0 items-center gap-[0.7rem] rounded-2xl px-[0.45rem] py-[0.35rem] transition-[background,color] duration-150 hover:bg-blog-accent-soft hover:text-blog-accent",
  brandSubtitle: "block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-left text-[0.74rem] leading-[1.4] text-blog-muted",
  brandText: "min-w-0",
  brandTitle: "block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-left text-[0.95rem] font-semibold leading-[1.4] text-blog-strong",
  close:
    "inline-flex h-[2.15rem] w-[2.15rem] items-center justify-center rounded-full bg-blog-bg text-blog-text transition-[background,color,transform] duration-150 hover:bg-blog-accent-soft hover:text-blog-accent active:scale-[0.94]",
  footer: "mt-auto border-t border-blog-border-muted px-4 pb-4 pt-[0.9rem]",
  header: "relative z-[45] mb-2 lg:hidden",
  inner:
    "relative min-h-[8.2rem] rounded-b-[24px] px-20 pb-8 pt-[2.3rem] text-center [background:var(--blog-mobile-header-bg)] shadow-[var(--blog-mobile-header-shadow)]",
  item:
    "flex min-h-[2.85rem] items-center gap-3 rounded-2xl border-l-[3px] border-transparent px-[0.8rem] text-blog-text transition-[background,color,transform] duration-150 hover:translate-x-0.5 hover:bg-blog-accent-soft hover:text-blog-accent active:translate-x-0.5 active:scale-[0.99]",
  itemActive: "border-l-blog-accent-line bg-blog-accent-soft text-blog-accent-strong",
  itemIcon: "inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[rgb(255_91_37_/_0.08)]",
  itemIconActive: "bg-[rgb(255_122_69_/_0.12)] text-blog-accent-strong",
  items: "grid gap-[0.35rem] overflow-y-auto px-[0.85rem] pb-[0.85rem] pt-1",
  layer: "invisible pointer-events-none fixed inset-0 z-[70] [transition:visibility_0s_linear_0.24s]",
  layerOpen: "visible pointer-events-auto [transition-delay:0s]",
  line: "block h-0.5 rounded-full bg-current transition-[opacity,transform] duration-[180ms]",
  lineFirstOpen: "translate-y-[6px] rotate-45",
  lineLastOpen: "-translate-y-[6px] -rotate-45",
  lineMiddleOpen: "scale-x-[0.4] opacity-0",
  lines: "grid w-5 gap-[0.28rem]",
  panel:
    "absolute bottom-3 left-3 top-3 flex w-[min(84vw,21rem)] max-w-[21rem] translate-x-[calc(-100%_-_1rem)] scale-[0.98] flex-col overflow-hidden rounded-[24px] border border-[var(--blog-mobile-panel-border)] bg-[var(--blog-mobile-panel-bg)] opacity-0 shadow-[var(--blog-mobile-panel-shadow)] transition-[opacity,transform] duration-[240ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]",
  panelHeader: "flex items-center justify-between gap-3 p-4",
  panelOpen: "translate-x-0 scale-100 opacity-100",
  subtitle: "mt-[0.35rem] text-[0.82rem] leading-[1.8] text-blog-text",
  title: "block text-[1.45rem] font-medium leading-[1.5] text-blog-strong transition-colors duration-150 hover:text-blog-accent",
  trigger:
    "absolute left-4 top-1/2 inline-flex h-[2.8rem] w-[2.8rem] -translate-y-1/2 cursor-pointer appearance-none items-center justify-center rounded-full border border-[var(--blog-mobile-trigger-border)] bg-[var(--blog-mobile-trigger-bg)] text-blog-strong shadow-[var(--blog-mobile-trigger-shadow)] transition-[background,box-shadow,color,transform] duration-[180ms] hover:bg-blog-accent-soft hover:text-blog-accent hover:shadow-[0_10px_22px_rgb(255_91_37_/_0.14)] active:-translate-y-1/2 active:scale-[0.96]"
};

export function MobileHeader({ title, subtitle, labels, currentRoute }: MobileHeaderProps) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  useBodyScrollLock(open);
  useEscapeKey(open, closeMenu);

  useEffect(() => {
    closeMenu();
  }, [currentRoute]);

  return (
    <header className={MOBILE_CLASS.header}>
      <div className={MOBILE_CLASS.inner}>
        <button
          type="button"
          className={MOBILE_CLASS.trigger}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={labels.menu}
        >
          <span className={MOBILE_CLASS.lines} aria-hidden="true">
            <span className={clsx(MOBILE_CLASS.line, open && MOBILE_CLASS.lineFirstOpen)} />
            <span className={clsx(MOBILE_CLASS.line, open && MOBILE_CLASS.lineMiddleOpen)} />
            <span className={clsx(MOBILE_CLASS.line, open && MOBILE_CLASS.lineLastOpen)} />
          </span>
        </button>
        <a href="/" className={MOBILE_CLASS.title} onClick={closeMenu}>
          {title}
        </a>
        <p className={MOBILE_CLASS.subtitle}>{subtitle}</p>
      </div>

      <div className={clsx(MOBILE_CLASS.layer, open && MOBILE_CLASS.layerOpen)} aria-hidden={!open}>
        <button type="button" className={clsx(MOBILE_CLASS.backdrop, open && MOBILE_CLASS.backdropOpen)} aria-label={labels.menu} onClick={closeMenu} />
        <nav className={clsx(MOBILE_CLASS.panel, open && MOBILE_CLASS.panelOpen)} aria-label={labels.menu}>
          <div className={MOBILE_CLASS.panelHeader}>
            <a href="/" className={MOBILE_CLASS.brand} onClick={closeMenu}>
              <img src="/images/bighead.svg" alt="" className={MOBILE_CLASS.avatar} />
              <span className={MOBILE_CLASS.brandText}>
                <span className={MOBILE_CLASS.brandTitle}>{title}</span>
                <span className={MOBILE_CLASS.brandSubtitle}>{subtitle}</span>
              </span>
            </a>
            <IconButton icon="close" label={labels.closeSearch} className={MOBILE_CLASS.close} onClick={closeMenu} />
          </div>

          <div className={MOBILE_CLASS.items}>
            {menuItems(labels).map((item) => {
              const active = isActive(currentRoute, item.href);
              return (
                <a key={item.href} href={item.href} onClick={closeMenu} className={clsx(MOBILE_CLASS.item, active && MOBILE_CLASS.itemActive)}>
                  <span className={clsx(MOBILE_CLASS.itemIcon, active && MOBILE_CLASS.itemIconActive)}>
                    <Icon name={item.icon} />
                  </span>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          <div className={MOBILE_CLASS.footer}>
            <ThemeToggle labels={labels} />
          </div>
        </nav>
      </div>
    </header>
  );
}

function isActive(route: string, href: string) {
  if (href === "/") return route === "/";
  return route.startsWith(href);
}
