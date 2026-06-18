import type { AppProps } from "../app/app-types";
import { ArticleMarkdown } from "../components/ArticleMarkdown";
import { UI_LABELS } from "../data/i18n";

export function PageView({ content, route }: AppProps) {
  const page = content.pages.find((item) => item.route === route.route);
  const labels = UI_LABELS[route.language];

  if (!page) {
    return <p>{labels.notFound}</p>;
  }

  return (
    <article className="content-card px-5 py-10 md:px-12 md:py-14 lg:px-16">
      <header className="mb-12 text-center">
        <h1 className="text-[1.7em] font-normal leading-normal text-[#555]">{page.title}</h1>
      </header>
      <ArticleMarkdown html={page.bodyHtml} />
    </article>
  );
}
