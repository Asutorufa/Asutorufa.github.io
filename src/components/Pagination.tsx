import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { MotionPresets } from "../animation/motion-presets";
import type { UiLabels } from "../types/content";
import { Icon } from "./Icon";
import styles from "./Pagination.module.css";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  labels: UiLabels;
  basePath?: string;
};

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

export function Pagination({ currentPage, totalPages, labels, basePath = "/" }: PaginationProps) {
  const prefersReducedMotion = useReducedMotion();
  const [editingCurrentPage, setEditingCurrentPage] = useState(false);
  const currentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditingCurrentPage(false);
  }, [currentPage]);

  useEffect(() => {
    if (!editingCurrentPage) return;
    currentInputRef.current?.focus();
    currentInputRef.current?.select();
  }, [editingCurrentPage]);

  if (totalPages <= 1) return null;

  const pages = visiblePages(currentPage, totalPages);
  const previous = currentPage > 1 ? pageHref(basePath, currentPage - 1) : null;
  const next = currentPage < totalPages ? pageHref(basePath, currentPage + 1) : null;

  const jumpToPage: FormSubmitHandler = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const rawPage = String(formData.get("page") ?? "").trim();
    if (!rawPage) return;

    const page = Number(rawPage);
    if (!Number.isFinite(page)) return;

    const targetPage = clampPage(Math.trunc(page), totalPages);
    if (targetPage === currentPage) return;
    window.location.href = pageHref(basePath, targetPage);
  };

  return (
    <nav className={clsx("content-card", styles.root)} aria-label="Pagination">
      {previous ? (
        <PaginationLink className={styles.link} href={previous} label={labels.previous} direction={-1} prefersReducedMotion={prefersReducedMotion}>
          <Icon name="angle-left" />
        </PaginationLink>
      ) : null}
      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className={styles.ellipsis}>
            ...
          </span>
        ) : item === currentPage ? (
          editingCurrentPage ? (
            <motion.form
              key={item}
              className={styles.currentForm}
              onSubmit={jumpToPage}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={MotionPresets.fast}
            >
              <input
                ref={currentInputRef}
                className={styles.currentInput}
                type="number"
                name="page"
                min={1}
                max={totalPages}
                defaultValue={currentPage}
                inputMode="numeric"
                aria-current="page"
                aria-label={`Current page. Enter a page from 1 to ${totalPages}`}
                title={`Page ${currentPage} / ${totalPages}. Press Enter to jump.`}
                onBlur={() => setEditingCurrentPage(false)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setEditingCurrentPage(false);
                }}
                style={{ width: `${String(totalPages).length + 1}ch` }}
              />
              <button type="submit" className="sr-only">
                Go to page
              </button>
            </motion.form>
          ) : (
            <motion.button
              key={item}
              type="button"
              className={styles.currentButton}
              aria-current="page"
              aria-label={`Current page ${currentPage}. Click to enter a page from 1 to ${totalPages}`}
              title={`Page ${currentPage} / ${totalPages}. Click to jump.`}
              whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.035 }}
              whileTap={prefersReducedMotion ? undefined : { y: 0, scale: 0.96 }}
              transition={MotionPresets.fast}
              onClick={() => setEditingCurrentPage(true)}
            >
              {currentPage}
            </motion.button>
          )
        ) : (
          <PaginationLink key={item} className={styles.link} href={pageHref(basePath, item)} prefersReducedMotion={prefersReducedMotion}>
            {item}
          </PaginationLink>
        )
      )}
      {next ? (
        <PaginationLink className={styles.link} href={next} label={labels.next} direction={1} prefersReducedMotion={prefersReducedMotion}>
          <Icon name="angle-right" />
        </PaginationLink>
      ) : null}
    </nav>
  );
}

function PaginationLink({
  children,
  className,
  direction = 0,
  href,
  label,
  prefersReducedMotion
}: {
  children: ReactNode;
  className: string;
  direction?: -1 | 0 | 1;
  href: string;
  label?: string;
  prefersReducedMotion: boolean | null;
}) {
  const linkVariants = prefersReducedMotion
    ? undefined
    : {
        hover: { scale: 1.06, y: -2 },
        tap: { scale: 0.94, y: 0 }
      };
  const contentVariants = prefersReducedMotion || direction === 0 ? undefined : { hover: { x: direction * 2 } };

  return (
    <motion.a
      className={className}
      href={href}
      aria-label={label}
      variants={linkVariants}
      whileHover={prefersReducedMotion ? undefined : "hover"}
      whileTap={prefersReducedMotion ? undefined : "tap"}
      transition={MotionPresets.fast}
    >
      <motion.span className={styles.linkContent} variants={contentVariants} transition={MotionPresets.fast}>
        {children}
      </motion.span>
    </motion.a>
  );
}

function pageHref(basePath: string, page: number) {
  const normalized = basePath.endsWith("/") ? basePath : `${basePath}/`;
  return page === 1 ? normalized : `${normalized}page/${page}/`;
}

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), totalPages);
}

function visiblePages(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const result: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) result.push("ellipsis");
  for (let page = start; page <= end; page += 1) {
    result.push(page);
  }
  if (end < totalPages - 1) result.push("ellipsis");

  result.push(totalPages);
  return result;
}
