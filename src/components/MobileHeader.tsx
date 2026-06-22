import clsx from "clsx";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MotionPresets } from "../animation/motion-presets";
import type { UiLabels } from "../types/content";
import { menuItems } from "../data/menu";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import styles from "./MobileHeader.module.css";

type MobileHeaderProps = {
  title: string;
  subtitle: string;
  labels: UiLabels;
  currentRoute: string;
};

export function MobileHeader({ title, subtitle, labels, currentRoute }: MobileHeaderProps) {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const closeMenu = () => setOpen(false);

  useBodyScrollLock(open);
  useEscapeKey(open, closeMenu);

  useEffect(() => {
    closeMenu();
  }, [currentRoute]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button type="button" className={styles.trigger} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={labels.menu}>
          <span className={styles.lines} aria-hidden="true">
            <span className={clsx(styles.line, open && styles.lineFirstOpen)} />
            <span className={clsx(styles.line, open && styles.lineMiddleOpen)} />
            <span className={clsx(styles.line, open && styles.lineLastOpen)} />
          </span>
        </button>
        <a href="/" className={styles.title} onClick={closeMenu}>
          {title}
        </a>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div className={styles.layer} aria-hidden={!open}>
            <motion.button
              type="button"
              className={styles.backdrop}
              aria-label={labels.menu}
              onClick={closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={MotionPresets.fast}
            />
            <motion.nav
              className={styles.panel}
              aria-label={labels.menu}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={MotionPresets.normal}
            >
              <div className={styles.panelHeader}>
                <a href="/" className={styles.brand} onClick={closeMenu}>
                  <img src="/images/bighead.svg" alt="" className={styles.avatar} />
                  <span className={styles.brandText}>
                    <span className={styles.brandTitle}>{title}</span>
                    <span className={styles.brandSubtitle}>{subtitle}</span>
                  </span>
                </a>
                <IconButton icon="close" label={labels.closeSearch} className={styles.close} onClick={closeMenu} />
              </div>

              <div className={styles.items}>
                {menuItems(labels).map((item) => {
                  const active = isActive(currentRoute, item.href);
                  return (
                    <a key={item.href} href={item.href} onClick={closeMenu} className={clsx(styles.item, active && styles.itemActive)}>
                      <span className={clsx(styles.itemIcon, active && styles.itemIconActive)}>
                        <Icon name={item.icon} />
                      </span>
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </div>

              <div className={styles.footer}>
                <ThemeToggle labels={labels} />
              </div>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function isActive(route: string, href: string) {
  if (href === "/") return route === "/";
  return route.startsWith(href);
}
