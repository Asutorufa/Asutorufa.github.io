import clsx from "clsx";
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
          {menuItems(labels).map((item) => (
            <a key={item.href} href={item.href} className={clsx(styles.navLink, isActive(currentRoute, item.href) && styles.navLinkActive)}>
              <Icon name={item.icon} className="w-[1.28571429em]" />
              <span>{item.label}</span>
            </a>
          ))}
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

  useEffect(() => {
    const headings = toc.map((item) => document.getElementById(item.id)).filter((node): node is HTMLElement => Boolean(node));
    if (headings.length === 0 || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0.01 }
    );

    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [toc]);

  return (
    <nav className={clsx(styles.tocScroll, "min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4")}>
      <ol className="space-y-2 text-[13px] font-normal leading-6 text-blog-text">
        {toc.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id} className={clsx(styles.tocItem, item.level > 2 && "ml-3 text-[12px]")}>
              {active ? <motion.span layoutId="toc-indicator" className={styles.tocIndicator} transition={MotionPresets.fast} /> : null}
              <a className={clsx(styles.tocLink, active && styles.tocLinkActive)} href={`#${item.id}`}>
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function ProfileCard({ content, labels, sticky }: { content: ContentManifest; labels: UiLabels; sticky: boolean }) {
  return (
    <section className={clsx("overflow-hidden rounded-2xl bg-blog-surface shadow-blog", sticky && "sticky top-4")}>
      <ProfileBody content={content} labels={labels} />
    </section>
  );
}

function ProfileBody({ content, labels, compact = false }: { content: ContentManifest; labels: UiLabels; compact?: boolean }) {
  const prefersReducedMotion = useReducedMotion();

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
      <div className="mt-6 grid grid-cols-3 divide-x divide-blog-border">
        <Stat href="/archives/" value={content.stats.posts} label={labels.posts} />
        <Stat href="/categories/" value={content.stats.categories} label={labels.categories.toLowerCase()} />
        <Stat href="/tags/" value={content.stats.tags} label={labels.tags.toLowerCase()} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-[13px] font-normal">
        <a className={clsx(styles.actionLink, "rounded px-2 py-1 transition-all active:translate-y-px")} href="/atom.xml">
          <Icon name="rss" className="mr-1" />
          {labels.rss}
        </a>
        <a
          className={clsx(styles.actionLink, "rounded px-2 py-1 transition-all active:translate-y-px")}
          href="https://github.com/Asutorufa"
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="github" className="mr-2" />
          GitHub
        </a>
        <a className={clsx(styles.actionLink, "rounded px-2 py-1 transition-all active:translate-y-px")} href="/email/">
          <Icon name="email" className="mr-2" />
          E-Mail
        </a>
      </div>
    </div>
  );
}

function Stat({ href, value, label }: { href: string; value: number; label: string }) {
  return (
    <a className={clsx(styles.statLink, "block rounded py-1 transition-all active:translate-y-px")} href={href}>
      <div className={clsx(styles.statValue, "text-[20px] font-bold leading-7")}>{value}</div>
      <div className={clsx(styles.statLabel, "mt-1 text-[13px] leading-5")}>{label}</div>
    </a>
  );
}

function isActive(route: string, href: string) {
  if (href === "/") return route === "/";
  return route.startsWith(href);
}
