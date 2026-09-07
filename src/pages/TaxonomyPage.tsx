import type { AppProps } from "../app/app-types";
import { Pagination } from "../components/Pagination";
import { Icon } from "../components/Icon";
import { UI_LABELS } from "../data/i18n";
import { formatDisplayDate } from "../utils/date";
import { useMemo, useState } from "react";
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
            <article key={post.abbrlink} className={styles.entry} data-scroll-route={post.route}>
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
  const popularEntries = useMemo(() => [...entries].sort(compareTagsByCount).slice(0, 16), [entries]);
  const filteredEntries = useMemo(() => {
    if (!normalizedQuery) return sortTagsByName(entries);
    return sortTagsByName(entries.filter((entry) => normalizeSearchQuery(entry.name).includes(normalizedQuery)));
  }, [entries, normalizedQuery]);
  const groups = useMemo(() => groupTags(filteredEntries, labels.otherTags), [filteredEntries, labels.otherTags]);

  return (
    <div className={styles.tagCloud}>
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

      {!hasQuery && popularEntries.length > 0 ? (
        <section className={styles.tagSection} aria-labelledby="popular-tags-title">
            <div className={styles.tagSectionHeader}>
              <h2 id="popular-tags-title" className={styles.tagSectionTitle}>
                {labels.popularTags}
              </h2>
              <span className={styles.tagSectionMeta}>{popularEntries.length}</span>
            </div>
            <div className={styles.tagList}>
              {popularEntries.map((entry) => (
                <TagLink key={entry.name} entry={entry} labels={labels} popular />
              ))}
            </div>
        </section>
      ) : null}

      <section className={styles.tagSection} aria-labelledby="all-tags-title">
        <div className={styles.tagSectionHeader}>
          <h2 id="all-tags-title" className={styles.tagSectionTitle}>
            {hasQuery ? labels.tagSearchResults : labels.allTags}
          </h2>
          <span className={styles.tagSectionMeta}>{hasQuery ? `${filteredEntries.length}/${entries.length}` : entries.length}</span>
        </div>
        {groups.length > 0 ? (
          groups.map((group) => (
            <div key={group.label} className={styles.tagGroup}>
                <div className={styles.tagGroupLabel}>{group.label}</div>
                <div className={styles.tagList}>
                  {group.entries.map((entry) => (
                    <TagLink key={entry.name} entry={entry} labels={labels} />
                  ))}
                </div>
            </div>
          ))
        ) : (
          <p className={styles.tagNoResults}>{labels.noResults}</p>
        )}
      </section>
    </div>
  );
}

function TagLink({ entry, labels, popular = false }: {
  entry: TaxonomyEntry;
  labels: (typeof UI_LABELS)[keyof typeof UI_LABELS];
  popular?: boolean;
}) {
  return (
    <a
      className={`${styles.tagLink} ${popular ? styles.tagLinkPopular : ""}`}
      href={entry.route}
      aria-label={`${entry.name}, ${entry.count} ${labels.posts}`}
    >
      <span className={styles.tagName}>{entry.name}</span>
      <span className={styles.tagCount}>{entry.count}</span>
    </a>
  );
}

function CategoryList({ entries, labels }: { entries: TaxonomyEntry[]; labels: (typeof UI_LABELS)[keyof typeof UI_LABELS] }) {
  const maxCount = Math.max(...entries.map((entry) => entry.count), 1);
  const sortedEntries = useMemo(() => [...entries].sort(compareTagsByCount), [entries]);

  return (
    <div className={styles.categoryBoard}>
      <div className={styles.categoryTitle}>
        {labels.all} {entries.length} {labels.category}
      </div>
      <div className={styles.categoryMatrix}>
        {sortedEntries.map((entry, index) => (
          <a
            key={entry.name}
            className={styles.categoryTile}
            href={entry.route}
            aria-label={`${entry.name}, ${entry.count} ${labels.posts}`}
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
          </a>
        ))}
      </div>
    </div>
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
