import type { Post } from "../types/content";
import { UI_LABELS } from "../data/i18n";
import { ArticleMarkdown } from "./ArticleMarkdown";
import { PostMeta } from "./PostMeta";

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const labels = UI_LABELS[post.language];

  return (
    <article className="content-card mb-3 px-4 py-8 md:mb-5 md:px-12 md:py-14 lg:px-16">
      <header className="text-center">
        <h2 className="text-[1.7em] font-normal leading-normal text-[#555]">
          <a className="transition-colors hover:text-[#ff5b25] active:text-[#e14d1d]" href={post.route}>{post.title}</a>
        </h2>
        <PostMeta post={post} />
      </header>
      {post.excerptMarkdown ? (
        <div className="mt-8 md:mt-10">
          <ArticleMarkdown html={post.excerptHtml ?? ""} />
        </div>
      ) : null}
      <div className="mt-8 text-center md:mt-10">
        <a className="read-more-button" href={post.route}>
          {labels.readMore} »
        </a>
      </div>
    </article>
  );
}
