import clsx from "clsx";
import { useState } from "react";
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

  return (
    <section className={clsx("flex flex-col overflow-hidden rounded-2xl bg-blog-surface shadow-blog", !mobile && "sticky top-4 max-h-[calc(100vh-2rem)]")}>
      <div className="flex justify-center gap-5 px-4 pt-5 text-[14px] font-normal">
        <button
          type="button"
          className={clsx(
            styles.tocTab,
            "border-b-2 pb-2 transition-all active:translate-y-px",
            activeTab === "toc"
              ? "border-blog-accent text-blog-accent"
              : clsx(styles.tocTabInactive, "border-transparent text-blog-text hover:text-blog-accent")
          )}
          onClick={() => setActiveTab("toc")}
        >
          {labels.postToc}
        </button>
        <button
          type="button"
          className={clsx(
            styles.tocTab,
            "border-b-2 pb-2 transition-all active:translate-y-px",
            activeTab === "overview"
              ? "border-blog-accent text-blog-accent"
              : clsx(styles.tocTabInactive, "border-transparent text-blog-text hover:text-blog-accent")
          )}
          onClick={() => setActiveTab("overview")}
        >
          {labels.siteOverview}
        </button>
      </div>
      {activeTab === "toc" ? <TocList toc={toc} /> : <ProfileBody content={content} labels={labels} compact />}
    </section>
  );
}

function TocList({ toc }: { toc: TocItem[] }) {
  return (
    <nav className={clsx(styles.tocScroll, "min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4")}>
      <ol className="space-y-2 text-[13px] font-normal leading-6 text-blog-text">
        {toc.map((item) => (
          <li key={item.id} className={clsx(item.level > 2 && "ml-3 text-[12px]")}>
            <a className={styles.tocLink} href={`#${item.id}`}>
              {item.text}
            </a>
          </li>
        ))}
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
  return (
    <div className={clsx("text-center", compact ? "px-4 pb-5 pt-5" : "px-4 py-6")}>
      <a className={clsx(styles.avatarLink, "mx-auto block h-28 w-28 rounded-full")} href="/about/" aria-label={labels.about}>
        <img src="/images/bighead.svg" alt="Asutorufa" className={clsx(styles.avatarImage, "h-28 w-28 rounded-full object-cover")} />
      </a>
      <div className="mt-6 grid grid-cols-3 divide-x divide-blog-border">
        <Stat href="/archives/" value={content.posts.length} label={labels.posts} />
        <Stat href="/categories/" value={content.categories.length} label={labels.categories.toLowerCase()} />
        <Stat href="/tags/" value={content.tags.length} label={labels.tags.toLowerCase()} />
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
