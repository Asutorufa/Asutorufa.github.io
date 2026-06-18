import { useEffect, useMemo, useState } from "react";
import type { SiteLanguage, UiLabels } from "../types/content";
import { Icon } from "./Icon";

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

  useEffect(() => {
    const syncHash = () => setOpen(window.location.hash === "#search");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (!open || records.length > 0) return;
    fetch("/search.json")
      .then((response) => response.json())
      .then((data: SearchRecord[]) => setRecords(data))
      .catch(() => setRecords([]));
  }, [open, records.length]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

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
      <div className="mx-auto max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-blog" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-neutral-200 p-4">
          <Icon name="search" className="text-neutral-400" />
          <input
            autoFocus
            className="min-w-0 flex-1 border-none text-base font-semibold outline-none"
            placeholder={labels.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            type="button"
            className="text-xl text-neutral-400 transition-colors hover:text-[#ff5b25] active:text-[#e14d1d]"
            aria-label={labels.closeSearch}
            onClick={closeSearch}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {query.trim() && results.length === 0 ? <p className="text-sm text-neutral-500">{labels.noResults}</p> : null}
          <div className="space-y-4">
            {results.map((result) => (
              <a key={result.url} href={result.url} className="group block rounded-lg border border-neutral-100 p-4 transition-all hover:-translate-y-0.5 hover:border-[#ffb1d8] hover:bg-[#fff7fc] active:translate-y-0">
                <h3 className="font-semibold text-neutral-800 transition-colors group-hover:text-[#ff5b25]">{result.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">{result.content.slice(0, 160)}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
