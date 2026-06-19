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
    <article
      className="content-card post-transition-surface mb-3 px-4 py-8 md:mb-5 md:px-8 md:py-14 lg:px-10"
      data-scroll-route={post.route}
      style={{ viewTransitionName: `post-${post.abbrlink}` }}
    >
      <header className="text-center">
        <h2 className="text-[1.7em] font-normal leading-normal text-[#555]">
          <a className="post-card-title-link transition-colors" href={post.route}>{post.title}</a>
        </h2>
        <PostMeta post={post} />
      </header>
      {post.excerptHtml ? (
        <div className="mt-8 md:mt-10">
          <ArticleMarkdown html={post.excerptHtml ?? ""} />
        </div>
      ) : null}
      <div className="mt-8 text-center md:mt-10">
        <a className="read-more-button" href={post.route}>
          <span>{labels.readMore}</span>
          <span className="read-more-button-icon" aria-hidden="true">
            »
          </span>
        </a>
      </div>
    </article>
  );
}
