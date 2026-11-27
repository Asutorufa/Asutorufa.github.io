import clsx from "clsx";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MotionEase, MotionPresets } from "../animation/motion-presets";
import { preferredSiteLanguage, SITE_LANGUAGE_CHANGE_EVENT } from "../utils/language";
import { threatListRoute } from "../utils/threats";
import type { ContentManifest, RouteEntry, UiLabels } from "../types/content";
import { menuItems } from "../data/menu";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { SiteLanguageSwitcher } from "./SiteLanguageSwitcher";
import styles from "./MobileHeader.module.css";

type MobileHeaderProps = {
  title: string;
  subtitle: string;
  content: ContentManifest;
  route: RouteEntry;
  labels: UiLabels;
  currentRoute: string;
};

export function MobileHeader({ title, subtitle, content, route, labels, currentRoute }: MobileHeaderProps) {
  const [open, setOpen] = useState(false);
  const [siteLanguage, setSiteLanguage] = useState(route.language);
  const navIndicatorId = useId();
  const prefersReducedMotion = useReducedMotion();
  const navItems = menuItems(labels, threatListRoute(siteLanguage));
  const closeMenu = () => setOpen(false);

  useBodyScrollLock(open);
  useEscapeKey(open, closeMenu);

  useEffect(() => {
    closeMenu();
  }, [currentRoute]);

  useEffect(() => {
    const updateSiteLanguage = () => setSiteLanguage(preferredSiteLanguage());
    updateSiteLanguage();
    window.addEventListener(SITE_LANGUAGE_CHANGE_EVENT, updateSiteLanguage);
    return () => window.removeEventListener(SITE_LANGUAGE_CHANGE_EVENT, updateSiteLanguage);
  }, [route.route]);

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
          <div className={styles.layer}>
            <motion.button
              type="button"
              className={styles.backdrop}
              aria-label={labels.menu}
              onClick={closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={prefersReducedMotion ? MotionPresets.instant : MotionPresets.normal}
            />
            <motion.nav
              className={styles.panel}
              aria-label={labels.menu}
              initial={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }}
              animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }}
              transition={prefersReducedMotion ? MotionPresets.instant : { duration: 0.26, ease: MotionEase.out }}
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
                {navItems.map((item) => {
                  const active = isActive(currentRoute, item.href);
                  return (
                    <a key={item.href} href={item.href} className={clsx(styles.item, active && styles.itemActive)} onClick={closeMenu}>
                      {active ? (
                        <motion.span
                          className={styles.itemIndicator}
                          layoutId={`mobile-nav-indicator-${navIndicatorId}`}
                          transition={prefersReducedMotion ? MotionPresets.instant : MotionPresets.spring}
                        />
                      ) : null}
                      <span className={clsx(styles.itemIcon, active && styles.itemIconActive)}>
                        <Icon name={item.icon} />
                      </span>
                      <span className={styles.itemLabel}>{item.label}</span>
                    </a>
                  );
                })}
              </div>

              <div className={styles.footer}>
                <ThemeToggle labels={labels} />
                <SiteLanguageSwitcher content={content} route={route} labels={labels} />
              </div>
            </motion.nav>
          </div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function isActive(route: string, href: string) {
  if (href === "/") return route === "/";
  return route.startsWith(href);
}
