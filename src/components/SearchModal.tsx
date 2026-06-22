import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import type { SiteLanguage, UiLabels } from "../types/content";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";

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

const SEARCH_CLASS = {
  panel: "mx-auto max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-blog-surface shadow-blog",
  header: "flex items-center gap-3 p-4",
  headerWithQuery: "border-b border-blog-border",
  input: "min-w-0 flex-1 border-none bg-transparent text-base font-semibold text-blog-heading outline-none placeholder:text-blog-faint",
  resultCard:
    "group block rounded-lg border border-blog-border-soft bg-blog-surface p-4 text-inherit transition-all hover:-translate-y-0.5 hover:border-blog-accent-border hover:bg-blog-accent-soft active:translate-y-0",
  resultExcerpt: "mt-2 line-clamp-2 text-sm leading-6 text-blog-muted",
  resultTitle: "font-semibold text-blog-text transition-colors group-hover:text-blog-accent-hover"
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
      <div className={SEARCH_CLASS.panel} onClick={(event) => event.stopPropagation()}>
        <div className={clsx(SEARCH_CLASS.header, hasQuery && SEARCH_CLASS.headerWithQuery)}>
          <Icon name="search" className="text-neutral-400" />
          <input
            autoFocus
            className={SEARCH_CLASS.input}
            placeholder={labels.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <IconButton
            icon="close"
            label={labels.closeSearch}
            className="text-xl text-neutral-400 transition-colors hover:text-blog-accent active:text-blog-accent-active"
            onClick={closeSearch}
          />
        </div>
        {hasQuery ? (
          <div className="max-h-[70vh] overflow-y-auto p-4">
            {results.length === 0 ? <p className="text-sm text-neutral-500">{labels.noResults}</p> : null}
            <div className="space-y-4">
              {results.map((result) => (
                <a key={result.url} href={result.url} className={SEARCH_CLASS.resultCard}>
                  <h3 className={SEARCH_CLASS.resultTitle}>{result.title}</h3>
                  <p className={SEARCH_CLASS.resultExcerpt}>{result.content.slice(0, 160)}</p>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
