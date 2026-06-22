import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import type { SiteLanguage, UiLabels } from "../types/content";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import styles from "./SearchModal.module.css";

type SearchRecord = {
  title: string;
  url: string;
  language: SiteLanguage;
  tags: string[];
  categories: string[];
  content: string;
};

type SearchModalProps = {
  labels: UiLabels;
};

export function SearchModal({ labels }: SearchModalProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState<SearchRecord[]>([]);
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    const syncHash = () => setOpen(window.location.hash === "#search");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("asutorufa-route-change", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("asutorufa-route-change", syncHash);
    };
  }, []);

  useEffect(() => {
    if (!open || records.length > 0) return;
    fetch("/search.json")
      .then((response) => response.json())
      .then((data: SearchRecord[]) => setRecords(data))
      .catch(() => setRecords([]));
  }, [open, records.length]);

  useEscapeKey(open, closeSearch);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return [];
    return records
      .filter((record) => {
        const haystack = `${record.title} ${record.tags.join(" ")} ${record.categories.join(" ")} ${record.content}`.toLocaleLowerCase();
        return haystack.includes(normalized);
      })
      .slice(0, 12);
  }, [query, records]);

  if (!open) return null;

  function closeSearch() {
    history.replaceState(null, "", window.location.pathname);
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 px-3 py-6" role="dialog" aria-modal="true" onClick={closeSearch}>
      <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
        <div className={clsx(styles.header, hasQuery && styles.headerWithQuery)}>
          <Icon name="search" className="text-blog-faint" />
          <input autoFocus className={styles.input} placeholder={labels.search} value={query} onChange={(event) => setQuery(event.target.value)} />
          <IconButton
            icon="close"
            label={labels.closeSearch}
            className="text-xl text-blog-faint transition-colors hover:text-blog-accent active:text-blog-accent-active"
            onClick={closeSearch}
          />
        </div>
        {hasQuery ? (
          <div className="max-h-[70vh] overflow-y-auto p-4">
            {results.length === 0 ? <p className="text-sm text-blog-muted">{labels.noResults}</p> : null}
            <div className="space-y-4">
              {results.map((result) => (
                <a key={result.url} href={result.url} className={styles.resultCard}>
                  <h3 className={styles.resultTitle}>{result.title}</h3>
                  <p className={styles.resultExcerpt}>{result.content.slice(0, 160)}</p>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
