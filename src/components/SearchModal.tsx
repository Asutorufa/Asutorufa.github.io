import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MotionPresets } from "../animation/motion-presets";
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
  const prefersReducedMotion = useReducedMotion();

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

  function closeSearch() {
    history.replaceState(null, "", window.location.pathname);
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 px-3 py-6"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={MotionPresets.normal}
          onClick={closeSearch}
        >
          <motion.div
            className={styles.panel}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: -14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -8 }}
            transition={{ ...MotionPresets.normal, duration: 0.22 }}
            onClick={(event) => event.stopPropagation()}
          >
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
            <AnimatePresence initial={false}>
              {hasQuery ? (
                <motion.div
                  key="search-results"
                  className="max-h-[70vh] overflow-y-auto p-4"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={MotionPresets.fast}
                >
                  <AnimatePresence mode="popLayout">
                    {results.length === 0 ? (
                      <motion.p
                        key="no-results"
                        className="text-sm text-blog-muted"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={MotionPresets.fast}
                      >
                        {labels.noResults}
                      </motion.p>
                    ) : (
                      <motion.div key="result-list" className="space-y-4">
                        {results.map((result, index) => (
                          <motion.a
                            key={result.url}
                            href={result.url}
                            className={styles.resultCard}
                            layout
                            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                            transition={{ ...MotionPresets.fast, delay: prefersReducedMotion ? 0 : Math.min(index * 0.025, 0.12) }}
                          >
                            <h3 className={styles.resultTitle}>{result.title}</h3>
                            <p className={styles.resultExcerpt}>{result.content.slice(0, 160)}</p>
                          </motion.a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
