import type { AppProps } from "../app/app-types";
import { Pagination } from "../components/Pagination";
import { Icon } from "../components/Icon";
import { UI_LABELS } from "../data/i18n";
import { formatDisplayDate } from "../utils/date";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MotionPresets } from "../animation/motion-presets";
import styles from "./TaxonomyPage.module.css";

type TaxonomyPageProps = AppProps & {
  type: "tag" | "category";
  name?: string;
  page?: number;
};

type TaxonomyEntry = { name: string; route: string; count: number };

export function TaxonomyPage({ content, route, type, name, page = 1 }: TaxonomyPageProps) {
  const entries = type === "tag" ? content.tags : content.categories;
  const totalPages = content.currentList?.totalPages ?? 1;
  const posts = name ? content.posts : [];
  const labels = UI_LABELS[route.language];
  const pluralTitle = type === "tag" ? labels.tags : labels.categories;
  const singularTitle = type === "tag" ? labels.tag : labels.category;

  if (!name) {
    return (
      <section className="content-card px-5 py-10 md:px-8 md:py-14 lg:px-10">
        <header className={type === "tag" ? "mb-7 text-center" : "mb-12 text-center"}>
          <h1 className="text-[1.7em] font-normal text-blog-heading">{pluralTitle}</h1>
        </header>
        {type === "tag" ? <TagCloud entries={entries} labels={labels} /> : <CategoryList entries={entries} labels={labels} />}
      </section>
    );
  }

  return (
    <>
      <section className="content-card px-5 py-10 md:px-8 md:py-14 lg:px-10">
        <div className={styles.timeline}>
          <header className={styles.title}>
            <h1>
              {name} <span>{singularTitle}</span>
            </h1>
          </header>
          {posts.map((post) => (
            <article key={post.abbrlink} className={styles.entry}>
              <time>{formatTaxonomyDate(post.date)}</time>
              <a href={post.route}>{post.title}</a>
            </article>
          ))}
        </div>
      </section>
      <Pagination currentPage={page} totalPages={totalPages} labels={labels} basePath={taxonomyBasePath(route.route, type)} />
    </>
  );
}

function taxonomyBasePath(route: string, type: "tag" | "category") {
  const root = type === "tag" ? "/tags/" : "/categories/";
  if (route === root) return root;
  return route.replace(/page\/\d+\/$/, "");
}

function formatTaxonomyDate(value?: string) {
  return formatDisplayDate(value).slice(5);
}

function TagCloud({ entries, labels }: { entries: TaxonomyEntry[]; labels: (typeof UI_LABELS)[keyof typeof UI_LABELS] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearchQuery(query);
  const hasQuery = normalizedQuery.length > 0;
  const prefersReducedMotion = useReducedMotion();
  const popularEntries = useMemo(() => [...entries].sort(compareTagsByCount).slice(0, 16), [entries]);
  const filteredEntries = useMemo(() => {
    if (!normalizedQuery) return sortTagsByName(entries);
    return sortTagsByName(entries.filter((entry) => normalizeSearchQuery(entry.name).includes(normalizedQuery)));
  }, [entries, normalizedQuery]);
  const groups = useMemo(() => groupTags(filteredEntries, labels.otherTags), [filteredEntries, labels.otherTags]);
  const sectionInitial = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 };
  const sectionExit = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 };

  return (
    <motion.div className={styles.tagCloud} initial={sectionInitial} animate={{ opacity: 1, y: 0 }} transition={MotionPresets.normal}>
      <div className={styles.tagCloudTitle}>
        {labels.all} {entries.length} {labels.tag}
      </div>
      <label className={styles.tagSearch}>
        <span className="sr-only">{labels.tagSearchPlaceholder}</span>
        <Icon name="search" className={styles.tagSearchIcon} />
        <input
          className={styles.tagSearchInput}
          type="search"
          value={query}
          placeholder={labels.tagSearchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <AnimatePresence initial={false}>
        {!hasQuery && popularEntries.length > 0 ? (
          <motion.section
            key="popular-tags"
            className={styles.tagSection}
            aria-labelledby="popular-tags-title"
            initial={sectionInitial}
            animate={{ opacity: 1, y: 0 }}
            exit={sectionExit}
            transition={MotionPresets.fast}
          >
            <div className={styles.tagSectionHeader}>
              <h2 id="popular-tags-title" className={styles.tagSectionTitle}>
                {labels.popularTags}
              </h2>
              <span className={styles.tagSectionMeta}>{popularEntries.length}</span>
            </div>
            <div className={styles.tagList}>
              {popularEntries.map((entry, index) => (
                <TagLink key={entry.name} entry={entry} labels={labels} index={index} popular prefersReducedMotion={prefersReducedMotion} />
              ))}
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <section className={styles.tagSection} aria-labelledby="all-tags-title">
        <div className={styles.tagSectionHeader}>
          <h2 id="all-tags-title" className={styles.tagSectionTitle}>
            {hasQuery ? labels.tagSearchResults : labels.allTags}
          </h2>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${hasQuery ? "results" : "all"}-${filteredEntries.length}`}
              className={styles.tagSectionMeta}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -4 }}
              transition={MotionPresets.fast}
            >
              {hasQuery ? `${filteredEntries.length}/${entries.length}` : entries.length}
            </motion.span>
          </AnimatePresence>
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          {groups.length > 0 ? (
            groups.map((group) => (
              <motion.div
                key={group.label}
                className={styles.tagGroup}
                layout
                initial={sectionInitial}
                animate={{ opacity: 1, y: 0 }}
                exit={sectionExit}
                transition={MotionPresets.fast}
              >
                <div className={styles.tagGroupLabel}>{group.label}</div>
                <div className={styles.tagList}>
                  {group.entries.map((entry, index) => (
                    <TagLink key={entry.name} entry={entry} labels={labels} index={index} prefersReducedMotion={prefersReducedMotion} />
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.p
              key="tag-no-results"
              className={styles.tagNoResults}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={MotionPresets.fast}
            >
              {labels.noResults}
            </motion.p>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}

function TagLink({
  entry,
  labels,
  index,
  popular = false,
  prefersReducedMotion
}: {
  entry: TaxonomyEntry;
  labels: (typeof UI_LABELS)[keyof typeof UI_LABELS];
  index: number;
  popular?: boolean;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <motion.a
      className={`${styles.tagLink} ${popular ? styles.tagLinkPopular : ""}`}
      href={entry.route}
      aria-label={`${entry.name}, ${entry.count} ${labels.posts}`}
      layout
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
      whileHover={prefersReducedMotion ? undefined : { y: -1 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ ...MotionPresets.fast, delay: prefersReducedMotion ? 0 : Math.min(index * 0.015, 0.12) }}
    >
      <span className={styles.tagName}>{entry.name}</span>
      <span className={styles.tagCount}>{entry.count}</span>
    </motion.a>
  );
}

function CategoryList({ entries, labels }: { entries: TaxonomyEntry[]; labels: (typeof UI_LABELS)[keyof typeof UI_LABELS] }) {
  const prefersReducedMotion = useReducedMotion();
  const maxCount = Math.max(...entries.map((entry) => entry.count), 1);
  const sortedEntries = useMemo(() => [...entries].sort(compareTagsByCount), [entries]);

  return (
    <motion.div
      className={styles.categoryBoard}
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={MotionPresets.normal}
    >
      <div className={styles.categoryTitle}>
        {labels.all} {entries.length} {labels.category}
      </div>
      <div className={styles.categoryMatrix}>
        {sortedEntries.map((entry, index) => (
          <motion.a
            key={entry.name}
            className={styles.categoryTile}
            href={entry.route}
            aria-label={`${entry.name}, ${entry.count} ${labels.posts}`}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={prefersReducedMotion ? undefined : { y: -1 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
            transition={{ ...MotionPresets.fast, delay: prefersReducedMotion ? 0 : Math.min(index * 0.025, 0.16) }}
          >
            <span className={styles.categoryRank}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.categoryTileBody}>
              <span className={styles.categoryTileMain}>
                <span className={styles.categoryName}>{entry.name}</span>
                <span className={styles.categoryCount}>
                  {entry.count} {labels.posts}
                </span>
              </span>
              <span className={styles.categoryMeter} aria-hidden="true">
                <span style={{ width: `${Math.max(8, (entry.count / maxCount) * 100)}%` }} />
              </span>
            </span>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}

function normalizeSearchQuery(value: string) {
  return value.trim().toLocaleLowerCase();
}

function compareTagsByCount(a: TaxonomyEntry, b: TaxonomyEntry) {
  return b.count - a.count || compareTagNames(a, b);
}

function sortTagsByName(entries: TaxonomyEntry[]) {
  return [...entries].sort(compareTagNames);
}

function compareTagNames(a: TaxonomyEntry, b: TaxonomyEntry) {
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
}

function groupTags(entries: TaxonomyEntry[], otherLabel: string) {
  const groups = new Map<string, TaxonomyEntry[]>();
  for (const entry of entries) {
    const label = tagGroupLabel(entry.name, otherLabel);
    groups.set(label, [...(groups.get(label) ?? []), entry]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => tagGroupOrder(a, otherLabel) - tagGroupOrder(b, otherLabel))
    .map(([label, groupEntries]) => ({ label, entries: groupEntries }));
}

function tagGroupLabel(name: string, otherLabel: string) {
  const first = name.trim().charAt(0).toLocaleUpperCase();
  if (/^[A-Z]$/.test(first)) return first;
  if (/^[0-9]$/.test(first)) return "0-9";
  return otherLabel;
}

function tagGroupOrder(label: string, otherLabel: string) {
  if (/^[A-Z]$/.test(label)) return label.charCodeAt(0);
  if (label === "0-9") return 100;
  if (label === otherLabel) return 101;
  return 102;
}
