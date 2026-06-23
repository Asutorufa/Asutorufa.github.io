import { UI_LABELS } from "../data/i18n";
import { Icon } from "../components/Icon";
import { formatDisplayDate } from "../utils/date";
import type { AppProps } from "../app/app-types";

export function WipPage({ content, route }: AppProps) {
  const labels = UI_LABELS[route.language];
  const posts = content.wipPosts;

  return (
    <section className="content-card px-4 py-8 md:px-8 md:py-12 lg:px-10">
      <header className="mb-8 text-center">
        <h1 className="text-[1.7em] font-normal leading-normal text-blog-heading">Work in Progress</h1>
        <p className="mt-2 text-[13px] text-blog-muted">
          {posts.length} {labels.posts}
        </p>
      </header>
      {posts.length > 0 ? (
        <ol className="divide-y divide-blog-border-muted">
          {posts.map((post) => (
            <li key={post.abbrlink} className="py-2 first:pt-0 last:pb-0">
              <a
                className="group -mx-3 block rounded-lg px-3 py-3 transition hover:-translate-y-0.5 hover:bg-blog-accent-soft active:translate-y-0 active:bg-blog-bg"
                href={post.route}
              >
                <span className="block text-[1.05rem] leading-7 text-blog-heading transition-colors group-hover:text-blog-accent">{post.title}</span>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-blog-faint">
                  <span>
                    <Icon name="calendar" className="mr-2" />
                    {formatDisplayDate(post.date)}
                  </span>
                  {post.updated && post.updated !== post.date ? (
                    <span>
                      <Icon name="calendar-check" className="mr-2" />
                      {formatDisplayDate(post.updated)}
                    </span>
                  ) : null}
                </span>
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-center text-[13px] text-blog-muted">No WIP posts.</p>
      )}
    </section>
  );
}
