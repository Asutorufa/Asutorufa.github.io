import clsx from "clsx";
import type { MouseEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MotionPresets } from "../animation/motion-presets";
import { preferredSiteLanguage, SITE_LANGUAGE_CHANGE_EVENT } from "../utils/language";
import { threatListRoute } from "../utils/threats";
import type { ContentManifest, Post, RouteEntry, TocItem, UiLabels } from "../types/content";
import { menuItems } from "../data/menu";
import { SiteLanguageSwitcher } from "./SiteLanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./Icon";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  content: ContentManifest;
  labels: UiLabels;
  route: RouteEntry;
  currentRoute: string;
  post?: Post;
  toc?: TocItem[];
  mobile?: boolean;
};

export function Sidebar({ content, labels, route, currentRoute, post, toc, mobile = false }: SidebarProps) {
  const activeToc = toc ?? post?.toc ?? [];
  const hasToc = activeToc.length > 0;
  const navIndicatorId = useId();
  const prefersReducedMotion = useReducedMotion();
  const [siteLanguage, setSiteLanguage] = useState(route.language);
  useEffect(() => {
    const updateSiteLanguage = () => setSiteLanguage(preferredSiteLanguage());
    updateSiteLanguage();
    window.addEventListener(SITE_LANGUAGE_CHANGE_EVENT, updateSiteLanguage);
    return () => window.removeEventListener(SITE_LANGUAGE_CHANGE_EVENT, updateSiteLanguage);
  }, [route.route]);
  const navItems = menuItems(labels, threatListRoute(siteLanguage));

  return (
    <div className={clsx(mobile ? "mt-4 space-y-4" : "h-full space-y-3")}>
      <section className="overflow-hidden rounded-2xl border border-blog-border-soft bg-blog-surface shadow-blog" data-sidebar-card="nav">
        <div className="px-4 py-5 text-center">
          <a
            href="/"
            className="block text-[20px] font-semibold leading-8 tracking-[-0.01em] text-blog-strong transition-colors hover:text-blog-accent active:text-blog-accent-active"
          >
            {content.config.title}
          </a>
          <p className="mt-1.5 text-[13px] font-normal text-blog-muted">{content.config.subtitle}</p>
        </div>
        <nav className="pb-4">
          <div className={styles.navMenu}>
            {navItems.map((item) => {
              const active = isActive(currentRoute, item.href);
              return (
                <a key={item.href} href={item.href} className={clsx(styles.navLink, active && styles.navLinkActive)}>
                  {active ? (
                    <motion.span
                      className={styles.navIndicator}
                      layoutId={`sidebar-nav-indicator-${navIndicatorId}`}
                      transition={prefersReducedMotion ? MotionPresets.instant : MotionPresets.spring}
                    />
                  ) : null}
                  <span className={styles.navIcon}>
                    <Icon name={item.icon} className="w-[1.28571429em]" />
                  </span>
                  <span className={styles.navLabel}>{item.label}</span>
                </a>
              );
            })}
          </div>
          <div className="px-5 pt-3">
            <ThemeToggle labels={labels} />
            <SiteLanguageSwitcher content={content} route={route} labels={labels} />
          </div>
        </nav>
      </section>

      {hasToc ? (
        <TocCard content={content} labels={labels} toc={activeToc} mobile={mobile} />
      ) : (
        <ProfileCard content={content} labels={labels} sticky={!mobile} />
      )}
    </div>
  );
}

function TocCard({ content, labels, toc, mobile }: { content: ContentManifest; labels: UiLabels; toc: TocItem[]; mobile: boolean }) {
  const [activeTab, setActiveTab] = useState<"toc" | "overview">("toc");
  const [direction, setDirection] = useState(1);
  const indicatorId = useId();
  const prefersReducedMotion = useReducedMotion();
  const activeTabIndex = activeTab === "toc" ? 0 : 1;

  const selectTab = (nextTab: "toc" | "overview") => {
    if (nextTab === activeTab) return;
    const nextIndex = nextTab === "toc" ? 0 : 1;
    setDirection(nextIndex > activeTabIndex ? 1 : -1);
    setActiveTab(nextTab);
  };

  return (
    <section
      className={clsx(
        "flex flex-col overflow-hidden rounded-2xl border border-blog-border-soft bg-blog-surface shadow-blog",
        !mobile && "sticky top-4 max-h-[calc(100vh-2rem)]"
      )}
      data-sidebar-card="toc"
    >
      <div className={styles.tocTabs}>
        {[
          ["toc", labels.postToc],
          ["overview", labels.siteOverview]
        ].map(([tab, label]) => {
          const active = activeTab === tab;
          return (
            <motion.button
              key={tab}
              type="button"
              className={clsx(styles.tocTab, active && styles.tocTabActive)}
              onClick={() => selectTab(tab as "toc" | "overview")}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              transition={MotionPresets.fast}
            >
              {active ? (
                <motion.span
                  className={styles.tocTabIndicator}
                  layoutId={`toc-tab-indicator-${indicatorId}`}
                  transition={prefersReducedMotion ? MotionPresets.instant : MotionPresets.spring}
                />
              ) : null}
              <span className={styles.tocTabLabel}>{label}</span>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={activeTab}
          custom={prefersReducedMotion ? 0 : direction}
          className="min-h-0 flex-1"
          variants={tocPanelVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={prefersReducedMotion ? MotionPresets.instant : MotionPresets.fast}
        >
          {activeTab === "toc" ? <TocList toc={toc} /> : <ProfileBody content={content} labels={labels} compact />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

const tocPanelVariants = {
  center: {
    opacity: 1,
    x: 0
  },
  enter: (direction: number) => ({
    opacity: 0,
    x: direction * 8
  }),
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -8
  })
};

function TocList({ toc }: { toc: TocItem[] }) {
  const [activeId, setActiveId] = useState(toc[0]?.id ?? "");
  const indicatorId = useId();
  const prefersReducedMotion = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let headings: HTMLElement[] = [];
    let frame = 0;

    const updateActiveHeading = () => {
      frame = 0;
      if (headings.length === 0) return;
      const nextActive = activeHeadingFromViewport(headings);
      if (nextActive) setActiveId((current) => (current === nextActive ? current : nextActive));
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveHeading);
    };

    const refreshHeadings = () => {
      headings = tocHeadings(toc);
      if (headings.length > 0) scheduleUpdate();
    };

    setActiveId(toc[0]?.id ?? "");
    refreshHeadings();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    window.addEventListener("asutorufa-route-change", refreshHeadings);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
      window.removeEventListener("asutorufa-route-change", refreshHeadings);
    };
  }, [toc]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !activeId) return;
    const activeLink = nav.querySelector<HTMLElement>(`a[href="#${CSS.escape(activeId)}"]`);
    if (!activeLink) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    if (linkRect.top < navRect.top + 16 || linkRect.bottom > navRect.bottom - 16) {
      activeLink.scrollIntoView({ block: "nearest", behavior: "auto" });
    }
  }, [activeId]);

  const navigateToTocItem = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    const url = new URL(window.location.href);
    url.hash = id;
    window.history.pushState(window.history.state, "", url);
    target.scrollIntoView({ block: "start" });

    window.requestAnimationFrame(() => {
      const nextActive = activeHeadingFromViewport(tocHeadings(toc));
      if (nextActive) setActiveId(nextActive);
    });
  };

  return (
    <nav ref={navRef} className={clsx(styles.tocScroll, "min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4")}>
      <ol className="space-y-2 text-[13px] font-normal leading-6 text-blog-text">
        {toc.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id} className={clsx(styles.tocItem, item.level > 2 && "ml-3 text-[12px]")}>
              {active ? (
                <motion.span
                  layoutId={`toc-indicator-${indicatorId}`}
                  className={styles.tocIndicator}
                  transition={prefersReducedMotion ? MotionPresets.instant : MotionPresets.spring}
                />
              ) : null}
              <a className={clsx(styles.tocLink, active && styles.tocLinkActive)} href={`#${item.id}`} onClick={(event) => navigateToTocItem(event, item.id)}>
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function tocHeadings(toc: TocItem[]) {
  return toc.map((item) => document.getElementById(item.id)).filter((node): node is HTMLElement => Boolean(node));
}

function activeHeadingFromViewport(headings: HTMLElement[]) {
  const ordered = headings.map((heading) => ({ heading, rect: heading.getBoundingClientRect() })).sort((left, right) => left.rect.top - right.rect.top);
  const visible = ordered.find(({ rect }) => rect.top >= 0 && rect.top < window.innerHeight);
  if (visible) return visible.heading.id;

  for (let index = ordered.length - 1; index >= 0; index -= 1) {
    if (ordered[index].rect.top < 0) return ordered[index].heading.id;
  }

  return ordered[0]?.heading.id;
}

function ProfileCard({ content, labels, sticky }: { content: ContentManifest; labels: UiLabels; sticky: boolean }) {
  return (
    <section
      className={clsx("overflow-hidden rounded-2xl border border-blog-border-soft bg-blog-surface shadow-blog", sticky && "sticky top-4")}
      data-sidebar-card="profile"
    >
      <ProfileBody content={content} labels={labels} />
    </section>
  );
}

function ProfileBody({ content, labels, compact = false }: { content: ContentManifest; labels: UiLabels; compact?: boolean }) {
  const [activeStat, setActiveStat] = useState<string | null>(null);
  const statIndicatorId = useId();
  const prefersReducedMotion = useReducedMotion();
  const stats = [
    { href: "/archives/", key: "posts", label: labels.posts, value: content.stats.posts },
    { href: "/categories/", key: "categories", label: labels.categories.toLowerCase(), value: content.stats.categories },
    { href: "/tags/", key: "tags", label: labels.tags.toLowerCase(), value: content.stats.tags }
  ];
  const socialLinks = [
    { href: "/atom.xml", icon: "rss", kind: "rss", label: labels.rss },
    { external: true, href: "https://github.com/Asutorufa", icon: "github", kind: "github", label: "GitHub" },
    { href: "/email/", icon: "email", kind: "email", label: "E-Mail" }
  ] as const;

  return (
    <div className={clsx("text-center", compact ? "px-4 pb-5 pt-5" : "px-4 py-6")}>
      <a className={clsx(styles.avatarLink, "mx-auto block h-28 w-28 rounded-full")} href="/about/" aria-label={labels.about}>
        <img src="/images/bighead.svg" alt="Asutorufa" className={clsx(styles.avatarImage, "h-28 w-28 rounded-full object-cover")} />
      </a>
      <div
        className={clsx(styles.statsGrid, "mt-6 grid grid-cols-3")}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActiveStat(null);
        }}
        onMouseLeave={() => setActiveStat(null)}
      >
        {stats.map((stat) => (
          <Stat
            key={stat.key}
            active={activeStat === stat.key}
            href={stat.href}
            indicatorId={statIndicatorId}
            label={stat.label}
            prefersReducedMotion={prefersReducedMotion}
            value={stat.value}
            onActivate={() => setActiveStat(stat.key)}
          />
        ))}
      </div>
      <div className={clsx(styles.socialGrid, "mt-5 text-[13px] font-normal")}>
        {socialLinks.map((link) => (
          <SocialLink key={link.kind} {...link} />
        ))}
      </div>
    </div>
  );
}

function Stat({
  active,
  href,
  indicatorId,
  label,
  onActivate,
  prefersReducedMotion,
  value
}: {
  active: boolean;
  href: string;
  indicatorId: string;
  label: string;
  onActivate: () => void;
  prefersReducedMotion: boolean | null;
  value: number;
}) {
  return (
    <a className={clsx(styles.statLink, active && styles.statLinkActive)} href={href} onFocus={onActivate} onMouseEnter={onActivate}>
      {active ? (
        <motion.span
          className={styles.statHighlight}
          layoutId={`profile-stat-highlight-${indicatorId}`}
          transition={prefersReducedMotion ? MotionPresets.instant : MotionPresets.spring}
        />
      ) : null}
      <span className={styles.statContent}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </span>
    </a>
  );
}

type SocialKind = "email" | "github" | "rss";

function SocialLink({ external, href, icon, kind, label }: { external?: boolean; href: string; icon: SocialKind; kind: SocialKind; label: string }) {
  return (
    <a className={styles.actionLink} href={href} data-kind={kind} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      <span className={styles.actionIcon}>
        <Icon name={icon} />
      </span>
      <span className={styles.actionLabel}>{label}</span>
    </a>
  );
}

function isActive(route: string, href: string) {
  if (href === "/") return route === "/";
  return route.startsWith(href);
}
