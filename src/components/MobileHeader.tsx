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
  const navItems = menuItems(labels);
  const activeNavIndex = navItems.findIndex((item) => isActive(currentRoute, item.href));
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
            <button type="button" className={styles.backdrop} aria-label={labels.menu} onClick={closeMenu} />
            <motion.nav
              className={styles.panel}
              aria-label={labels.menu}
              initial={prefersReducedMotion ? { x: 0 } : { x: -12 }}
              animate={{ x: 0 }}
              exit={prefersReducedMotion ? { x: 0 } : { x: -12 }}
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
                {activeNavIndex >= 0 ? (
                  <motion.span
                    className={styles.itemIndicator}
                    animate={{ y: activeNavIndex * MOBILE_NAV_ITEM_STEP }}
                    initial={false}
                    transition={prefersReducedMotion ? MotionPresets.fast : MotionPresets.spring}
                  />
                ) : null}
                {navItems.map((item) => {
                  const active = isActive(currentRoute, item.href);
                  return (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      animate="idle"
                      className={clsx(styles.item, active && styles.itemActive)}
                      initial="idle"
                      onClick={closeMenu}
                      whileFocus={prefersReducedMotion ? undefined : "hover"}
                      whileHover={prefersReducedMotion ? undefined : "hover"}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.985, x: 1 }}
                      transition={MotionPresets.spring}
                    >
                      <motion.span
                        className={clsx(styles.itemIcon, active && styles.itemIconActive)}
                        variants={mobileNavIconVariants}
                        transition={MotionPresets.spring}
                      >
                        <Icon name={item.icon} />
                      </motion.span>
                      <span>{item.label}</span>
                    </motion.a>
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

const MOBILE_NAV_ITEM_STEP = 51.2;

const mobileNavIconVariants = {
  hover: {
    rotate: -7,
    scale: 1.08,
    x: 2,
    y: -1
  },
  idle: {
    rotate: 0,
    scale: 1,
    x: 0,
    y: 0
  }
};

function isActive(route: string, href: string) {
  if (href === "/") return route === "/";
  return route.startsWith(href);
}
