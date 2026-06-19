import type { AppProps } from "../app/app-types";
import { ArticleMarkdown } from "../components/ArticleMarkdown";
import { GitalkComments } from "../components/GitalkComments";
import { UI_LABELS } from "../data/i18n";

export function PageView({ content, route }: AppProps) {
  const page = content.pages.find((item) => item.route === route.route);
  const labels = UI_LABELS[route.language];

  if (!page) {
    return <p>{labels.notFound}</p>;
  }

  const showComments = ["/about/", "/friends/"].includes(page.route) && page.comments;

  return (
    <>
      <article className="content-card px-5 py-10 md:px-8 md:py-14 lg:px-10">
        <header className="mb-12 text-center">
          <h1 className="text-[1.7em] font-normal leading-normal text-[#555]">{page.title}</h1>
        </header>
        <ArticleMarkdown html={page.bodyHtml} />
      </article>
      {showComments ? (
        <section className="comments-card content-card mt-4 px-4 py-5 md:mt-6 md:px-8 md:py-7 lg:px-10">
          <GitalkComments id={page.route} language={page.language} />
        </section>
      ) : null}
    </>
  );
}
