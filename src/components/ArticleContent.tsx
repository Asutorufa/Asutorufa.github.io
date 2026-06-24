import type { ReactNode } from "react";
import type { AppProps } from "../app/app-types";
import { UI_LABELS } from "../data/i18n";
import { ArticleMarkdown } from "./ArticleMarkdown";
import { GitalkComments } from "./GitalkComments";
import { PostFooter } from "./PostFooter";
import { PostMeta } from "./PostMeta";

type ArticleContentProps = AppProps & {
  abbrlink: string;
  leading?: ReactNode;
};

export function ArticleContent({ content, route, abbrlink, leading }: ArticleContentProps) {
  const posts = route.kind === "wip-post" ? content.wipPosts : content.posts;
  const index = posts.findIndex((item) => item.abbrlink === abbrlink);
  const post = posts[index];

  if (!post) {
    return <p>Post not found.</p>;
  }

  const labels = UI_LABELS[post.language];
  const newerPost = index > 0 ? posts[index - 1] : undefined;
  const olderPost = index < posts.length - 1 ? posts[index + 1] : undefined;
  const showComments = route.kind === "post" && post.comments;

  return (
    <>
      <article className="content-card px-4 py-8 [contain:paint] md:px-8 md:py-14 lg:px-10">
        {leading}
        <header className="mb-12 text-center md:mb-16">
          <h1 className="text-[1.7em] font-normal leading-normal text-blog-heading">{post.title}</h1>
          <div>
            <PostMeta post={post} />
          </div>
        </header>
        <ArticleMarkdown html={post.bodyHtml} />
        <PostFooter config={content.config} labels={labels} post={post} olderPost={olderPost} newerPost={newerPost} />
      </article>
      {showComments ? (
        <section id="comments" className="content-card mt-4 overflow-hidden px-4 py-5 md:mt-6 md:px-8 md:py-7 lg:px-10">
          <GitalkComments id={post.route} language={post.language} />
        </section>
      ) : null}
    </>
  );
}
