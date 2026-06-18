import type { UiLabels } from "../types/content";
import { Icon } from "./Icon";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  labels: UiLabels;
  basePath?: string;
};

export function Pagination({ currentPage, totalPages, labels, basePath = "/" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = visiblePages(currentPage, totalPages);
  const previous = currentPage > 1 ? pageHref(basePath, currentPage - 1) : null;
  const next = currentPage < totalPages ? pageHref(basePath, currentPage + 1) : null;

  return (
    <nav className="pagination-bar content-card mt-8 flex w-full max-w-full items-center justify-center gap-4 px-6 py-2 text-sm font-normal" aria-label="Pagination">
      {previous ? (
        <a className="pagination-link" href={previous} aria-label={labels.previous}>
          <Icon name="angle-left" />
        </a>
      ) : null}
      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-neutral-500">
            ...
          </span>
        ) : item === currentPage ? (
          <span key={item} className="pagination-link pagination-current" aria-current="page">
            {item}
          </span>
        ) : (
          <a key={item} className="pagination-link" href={pageHref(basePath, item)}>
            {item}
          </a>
        )
      )}
      {next ? (
        <a className="pagination-link" href={next} aria-label={labels.next}>
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
