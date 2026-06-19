import { useEffect, useState } from "react";
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
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    closeMenu();
  }, [currentRoute]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="mobile-header lg:hidden">
      <div className="mobile-header-inner">
        <button
          type="button"
          className={`mobile-menu-trigger ${open ? "is-open" : ""}`}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={labels.menu}
        >
          <span className="mobile-menu-trigger-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
        <a href="/" className="mobile-header-title" onClick={closeMenu}>
          {title}
        </a>
        <p className="mobile-header-subtitle">{subtitle}</p>
      </div>

      <div className={`mobile-menu-layer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <button type="button" className="mobile-menu-backdrop" aria-label={labels.menu} onClick={closeMenu} />
        <nav className="mobile-menu-panel" aria-label={labels.menu}>
          <div className="mobile-menu-panel-header">
            <a href="/" className="mobile-menu-brand" onClick={closeMenu}>
              <img src="/images/bighead.svg" alt="" className="mobile-menu-avatar" />
              <span>
                <span className="mobile-menu-brand-title">{title}</span>
                <span className="mobile-menu-brand-subtitle">{subtitle}</span>
              </span>
            </a>
            <button type="button" className="mobile-menu-close" onClick={closeMenu} aria-label={labels.closeSearch}>
              <Icon name="close" />
            </button>
          </div>

          <div className="mobile-menu-items">
            {menuItems(labels).map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`mobile-menu-item ${isActive(currentRoute, item.href) ? "is-active" : ""}`}
              >
                <span className="mobile-menu-item-icon">
                  <Icon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>

          <div className="mobile-menu-footer">
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
