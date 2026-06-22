import type { AppProps } from "../app/app-types";
import { Pagination } from "../components/Pagination";
import { UI_LABELS } from "../data/i18n";
import styles from "./ArchivePage.module.css";

type ArchivePageProps = AppProps & {
  year?: string;
  month?: string;
  page?: number;
};

export function ArchivePage({ content, route, year, month, page = 1 }: ArchivePageProps) {
  const totalPages = content.currentList?.totalPages ?? 1;
  const totalPosts = content.currentList?.totalPosts ?? content.stats.posts;
  const posts = content.posts;
  const groups = groupPostsByYear(posts);
  const labels = UI_LABELS[route.language];
  const title = month && year ? `${labels.archiveTitle}: ${year}/${month}` : year ? `${labels.archiveTitle}: ${year}` : labels.archiveTitle;

  return (
    <>
      <section className="content-card px-5 py-10 md:px-8 md:py-14 lg:px-10">
        <header className="mb-10 text-center">
          <h1 className="text-[1.7em] font-normal text-blog-heading">{title}</h1>
        </header>

        <div className={styles.timeline}>
          {!year && page === 1 ? (
            <p className={styles.summary}>
              Nice! {totalPosts} {labels.posts} in total. Keep on posting.
            </p>
          ) : null}

          {groups.map((group) => (
            <section key={group.year} className={styles.year}>
              <h2>{group.year}</h2>
              {group.posts.map((post) => (
                <article key={post.abbrlink} className={styles.entry}>
                  <time>{formatArchiveDate(post.date)}</time>
                  <a href={post.route}>{post.title}</a>
                </article>
              ))}
            </section>
          ))}
        </div>
      </section>
      <Pagination currentPage={page} totalPages={totalPages} labels={labels} basePath={archiveBasePath(year, month)} />
    </>
  );
}

function archiveBasePath(year?: string, month?: string) {
  if (year && month) return `/archives/${year}/${month}/`;
  if (year) return `/archives/${year}/`;
  return "/archives/";
}

function groupPostsByYear(posts: AppProps["content"]["posts"]) {
  const groups = new Map<string, AppProps["content"]["posts"]>();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }

  return [...groups].map(([year, groupedPosts]) => ({ year, posts: groupedPosts }));
}

function formatArchiveDate(value: string) {
  return value.slice(5, 10);
}
