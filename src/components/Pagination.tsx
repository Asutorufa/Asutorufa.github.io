import clsx from "clsx";
import type { ComponentProps } from "react";
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
        <a className={styles.link} href={previous} aria-label={labels.previous}>
          <Icon name="angle-left" />
        </a>
      ) : null}
      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className={styles.ellipsis}>
            ...
          </span>
        ) : item === currentPage ? (
          <form key={item} className={styles.currentForm} onSubmit={jumpToPage}>
            <input
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
              onFocus={(event) => event.currentTarget.select()}
              style={{ width: `${String(totalPages).length + 1}ch` }}
            />
            <button type="submit" className="sr-only">
              Go to page
            </button>
          </form>
        ) : (
          <a key={item} className={styles.link} href={pageHref(basePath, item)}>
            {item}
          </a>
        )
      )}
      {next ? (
        <a className={styles.link} href={next} aria-label={labels.next}>
          <Icon name="angle-right" />
        </a>
      ) : null}
    </nav>
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
