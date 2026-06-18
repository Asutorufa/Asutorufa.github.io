import type { AppProps } from "../app/app-types";
import { ArticleMarkdown } from "../components/ArticleMarkdown";
import { GitalkComments } from "../components/GitalkComments";
import { PostFooter } from "../components/PostFooter";
import { PostMeta } from "../components/PostMeta";
import { UI_LABELS } from "../data/i18n";

type PostPageProps = AppProps & {
  abbrlink: string;
};

export function PostPage({ content, abbrlink }: PostPageProps) {
  const index = content.posts.findIndex((item) => item.abbrlink === abbrlink);
  const post = content.posts[index];

  if (!post) {
    return <p>Post not found.</p>;
  }

  const labels = UI_LABELS[post.language];
  const newerPost = index > 0 ? content.posts[index - 1] : undefined;
  const olderPost = index < content.posts.length - 1 ? content.posts[index + 1] : undefined;

  return (
    <article className="content-card px-4 py-8 md:px-12 md:py-14 lg:px-16">
      <header className="mb-12 text-center md:mb-16">
        <h1 className="text-[1.7em] font-normal leading-normal text-[#555]">{post.title}</h1>
        <PostMeta post={post} />
      </header>
      <ArticleMarkdown html={post.bodyHtml} />
      <PostFooter config={content.config} labels={labels} post={post} olderPost={olderPost} newerPost={newerPost} />
      {post.comments ? <GitalkComments id={post.route} /> : null}
    </article>
  );
}
