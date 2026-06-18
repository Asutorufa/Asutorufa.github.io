import type { BlogConfig, Post, UiLabels } from "../types/content";
import { taxonomyRoute } from "../utils/route";
import { Icon } from "./Icon";

type PostFooterProps = {
  config: BlogConfig;
  labels: UiLabels;
  post: Post;
  olderPost?: Post;
  newerPost?: Post;
};

export function PostFooter({ config, labels, post, olderPost, newerPost }: PostFooterProps) {
  const permalink = new URL(post.route, config.url).toString();

  return (
    <footer className="mt-16">
      <section className="border-l-4 border-[#ff3b1f] bg-neutral-50 px-5 py-5 text-[14px] font-normal leading-8 text-neutral-600 md:px-7">
        <p>
          <span className="mr-3 font-bold">{labels.authorLabel}</span>
          {config.author}
        </p>
        <p>
          <span className="mr-3 font-bold">{labels.permalinkLabel}</span>
          <a className="border-b border-neutral-400 text-neutral-800 transition-colors hover:border-[#ff5b25] hover:text-[#ff5b25]" href={post.route}>
            {permalink}
          </a>
        </p>
        <p>
          <span className="mr-3 font-bold">{labels.copyrightLabel}</span>
          {labels.copyrightText}{" "}
          <a className="border-b border-neutral-400 text-neutral-800 transition-colors hover:border-[#ff5b25] hover:text-[#ff5b25]" href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer">
            CC BY-NC-SA 4.0
          </a>
          .
        </p>
      </section>

      {post.tags.length > 0 ? (
        <nav className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-normal text-neutral-700">
          {post.tags.map((tag) => (
            <a key={tag} className="border-b border-neutral-400 transition-colors hover:border-[#ff5b25] hover:text-[#ff5b25]" href={taxonomyRoute("tags", tag)}>
              # {tag}
            </a>
          ))}
        </nav>
      ) : null}

      <nav className="mt-10 grid min-w-0 grid-cols-1 gap-4 border-t border-neutral-200 pt-7 text-base font-normal text-neutral-800 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 overflow-hidden">
          {olderPost ? (
            <a className="group flex min-w-0 max-w-full items-center gap-2 overflow-hidden transition-colors hover:text-[#ff5b25] active:text-[#e14d1d]" href={olderPost.route}>
              <Icon name="chevron-left" className="shrink-0" />
              <span className="min-w-0 truncate">{olderPost.title}</span>
            </a>
          ) : null}
        </div>
        <div className="min-w-0 overflow-hidden">
          {newerPost ? (
            <a className="group flex min-w-0 max-w-full items-center justify-start gap-2 overflow-hidden transition-colors hover:text-[#ff5b25] active:text-[#e14d1d] md:justify-end" href={newerPost.route}>
              <span className="min-w-0 truncate">{newerPost.title}</span>
              <Icon name="chevron-right" className="shrink-0" />
            </a>
          ) : null}
        </div>
      </nav>
    </footer>
  );
}
