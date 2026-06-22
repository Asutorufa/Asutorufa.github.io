import type { AppProps } from "../app/app-types";
import { Pagination } from "../components/Pagination";
import { PostCard } from "../components/PostCard";
import { UI_LABELS } from "../data/i18n";

type HomePageProps = AppProps & {
  page: number;
};

export function HomePage({ content, route, page }: HomePageProps) {
  const totalPages = content.currentList?.totalPages ?? Math.max(1, Math.ceil(content.stats.posts / content.config.perPage));
  const posts = content.posts;
  const labels = UI_LABELS[route.language];

  return (
    <section>
      <h1 className="sr-only">{content.config.title}</h1>
      {posts.map((post) => (
        <PostCard key={post.abbrlink} post={post} />
      ))}
      <Pagination currentPage={page} totalPages={totalPages} labels={labels} />
    </section>
  );
}
