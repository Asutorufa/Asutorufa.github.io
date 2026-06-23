import clsx from "clsx";
import type { MouseEvent } from "react";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MotionPresets } from "../animation/motion-presets";
import type { ContentManifest, Post, TocItem, UiLabels } from "../types/content";
import { menuItems } from "../data/menu";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./Icon";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  content: ContentManifest;
  labels: UiLabels;
  currentRoute: string;
  post?: Post;
  mobile?: boolean;
};

export function Sidebar({ content, labels, currentRoute, post, mobile = false }: SidebarProps) {
  const hasToc = Boolean(post?.toc.length);
  const prefersReducedMotion = useReducedMotion();
  const navItems = menuItems(labels);
  const activeNavIndex = navItems.findIndex((item) => isActive(currentRoute, item.href));

  return (
    <div className={clsx(mobile ? "mt-4 space-y-4" : "h-full space-y-3")}>
      <section className="overflow-hidden rounded-2xl bg-blog-surface shadow-blog">
        <div className="px-4 py-5 text-center">
          <a
            href="/"
            className="block text-[20px] font-normal leading-9 text-blog-strong transition-colors hover:text-blog-accent active:text-blog-accent-active"
          >
            {content.config.title}
          </a>
          <p className="mt-3 text-[13px] font-normal">{content.config.subtitle}</p>
        </div>
        <nav className="pb-4">
          <div className={styles.navMenu}>
            {activeNavIndex >= 0 ? (
              <motion.span
                className={styles.navIndicator}
                animate={{ opacity: 1, y: activeNavIndex * NAV_ITEM_HEIGHT }}
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
                  className={clsx(styles.navLink, active && styles.navLinkActive)}
                  initial="idle"
                  whileFocus={prefersReducedMotion ? undefined : "hover"}
                  whileHover={prefersReducedMotion ? undefined : "hover"}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.985, x: 1 }}
                  transition={MotionPresets.spring}
                >
                  <motion.span className={styles.navIcon} variants={navIconVariants} transition={MotionPresets.spring}>
                    <Icon name={item.icon} className="w-[1.28571429em]" />
                  </motion.span>
                  <span className={styles.navLabel}>{item.label}</span>
                </motion.a>
              );
            })}
          </div>
          <div className="px-5 pt-3">
            <ThemeToggle labels={labels} />
          </div>
        </nav>
      </section>

      {hasToc && post ? (
        <TocCard content={content} labels={labels} toc={post.toc} mobile={mobile} />
      ) : (
        <ProfileCard content={content} labels={labels} sticky={!mobile} />
      )}
    </div>
  );
}

const NAV_ITEM_HEIGHT = 40;

const navIconVariants = {
  hover: {
    rotate: -7,
    scale: 1.1,
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

function TocCard({ content, labels, toc, mobile }: { content: ContentManifest; labels: UiLabels; toc: TocItem[]; mobile: boolean }) {
  const [activeTab, setActiveTab] = useState<"toc" | "overview">("toc");
  const [direction, setDirection] = useState(1);
  const indicatorId = useId();
  const prefersReducedMotion = useReducedMotion();
  const activeTabIndex = activeTab === "toc" ? 0 : 1;

  const selectTab = (nextTab: "toc" | "overview") => {
    const nextIndex = nextTab === "toc" ? 0 : 1;
    setDirection(nextIndex > activeTabIndex ? 1 : -1);
    setActiveTab(nextTab);
  };

  return (
    <section className={clsx("flex flex-col overflow-hidden rounded-2xl bg-blog-surface shadow-blog", !mobile && "sticky top-4 max-h-[calc(100vh-2rem)]")}>
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
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              transition={MotionPresets.fast}
            >
              {active ? (
                <motion.span className={styles.tocTabIndicator} layoutId={`toc-tab-indicator-${indicatorId}`} transition={MotionPresets.spring} />
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
          transition={MotionPresets.fast}
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
    x: direction * 12
  }),
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -12
  })
};

function TocList({ toc }: { toc: TocItem[] }) {
  const [activeId, setActiveId] = useState(toc[0]?.id ?? "");
  const prefersReducedMotion = useReducedMotion();

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
    const observer = new MutationObserver(refreshHeadings);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    window.addEventListener("asutorufa-route-change", refreshHeadings);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
      window.removeEventListener("asutorufa-route-change", refreshHeadings);
    };
  }, [toc]);

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
    <nav className={clsx(styles.tocScroll, "min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4")}>
      <ol className="space-y-2 text-[13px] font-normal leading-6 text-blog-text">
        {toc.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id} className={clsx(styles.tocItem, item.level > 2 && "ml-3 text-[12px]")}>
              {active ? <motion.span layoutId="toc-indicator" className={styles.tocIndicator} transition={MotionPresets.spring} /> : null}
              <motion.a
                className={clsx(styles.tocLink, active && styles.tocLinkActive)}
                href={`#${item.id}`}
                onClick={(event) => navigateToTocItem(event, item.id)}
                whileHover={prefersReducedMotion ? undefined : { x: 3 }}
                whileTap={prefersReducedMotion ? undefined : { x: 1 }}
                transition={MotionPresets.fast}
              >
                {item.text}
              </motion.a>
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
    <section className={clsx("overflow-hidden rounded-2xl bg-blog-surface shadow-blog", sticky && "sticky top-4")}>
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
      <motion.a
        className={clsx(styles.avatarLink, "mx-auto block h-28 w-28 rounded-full")}
        href="/about/"
        aria-label={labels.about}
        whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.025 }}
        whileTap={prefersReducedMotion ? undefined : { y: 0, scale: 0.96 }}
        transition={MotionPresets.spring}
      >
        <img src="/images/bighead.svg" alt="Asutorufa" className={clsx(styles.avatarImage, "h-28 w-28 rounded-full object-cover")} />
      </motion.a>
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
          <SocialLink key={link.kind} {...link} prefersReducedMotion={prefersReducedMotion} />
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
    <motion.a
      className={styles.statLink}
      href={href}
      onFocus={onActivate}
      onHoverStart={onActivate}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97, y: 0 }}
      transition={MotionPresets.spring}
    >
      {active ? <motion.span className={styles.statHighlight} layoutId={`profile-stat-highlight-${indicatorId}`} transition={MotionPresets.spring} /> : null}
      <motion.span className={styles.statContent} animate={active ? "active" : "idle"} initial={false}>
        <motion.span className={styles.statValue} variants={statValueVariants} transition={MotionPresets.fast}>
          {value}
        </motion.span>
        <motion.span className={styles.statLabel} variants={statLabelVariants} transition={MotionPresets.fast}>
          {label}
        </motion.span>
      </motion.span>
    </motion.a>
  );
}

const statValueVariants = {
  active: {
    color: "var(--blog-accent-strong)"
  },
  idle: {
    color: "var(--blog-strong)"
  }
};

const statLabelVariants = {
  active: {
    color: "var(--blog-accent-hover)",
    y: -1
  },
  idle: {
    color: "var(--blog-muted)",
    y: 0
  }
};

type SocialKind = "email" | "github" | "rss";

function SocialLink({
  external,
  href,
  icon,
  kind,
  label,
  prefersReducedMotion
}: {
  external?: boolean;
  href: string;
  icon: SocialKind;
  kind: SocialKind;
  label: string;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <motion.a
      className={styles.actionLink}
      href={href}
      animate="initial"
      initial="initial"
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      whileFocus={prefersReducedMotion ? undefined : "hover"}
      whileHover={prefersReducedMotion ? undefined : "hover"}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97, y: 0 }}
      transition={MotionPresets.spring}
    >
      <motion.span className={styles.actionIcon} variants={socialIconVariants[kind]} transition={kind === "rss" ? MotionPresets.fast : MotionPresets.spring}>
        <Icon name={icon} />
      </motion.span>
      <span className={styles.actionLabel}>{label}</span>
    </motion.a>
  );
}

const socialIconVariants = {
  email: {
    hover: {
      rotate: -6,
      x: 2,
      y: -2
    },
    initial: {
      rotate: 0,
      x: 0,
      y: 0
    }
  },
  github: {
    hover: {
      rotate: -10,
      scale: 1.12,
      y: -2
    },
    initial: {
      rotate: 0,
      scale: 1,
      y: 0
    }
  },
  rss: {
    hover: {
      rotate: -8,
      scale: 1.1,
      x: -1,
      y: -1
    },
    initial: {
      rotate: 0,
      scale: 1,
      x: 0,
      y: 0
    }
  }
};

function isActive(route: string, href: string) {
  if (href === "/") return route === "/";
  return route.startsWith(href);
}
