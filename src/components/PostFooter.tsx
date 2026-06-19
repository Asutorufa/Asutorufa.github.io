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
  const adjacentClassName = `post-adjacent-nav ${olderPost && newerPost ? "post-adjacent-nav--paired" : "post-adjacent-nav--single"}`;

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

      <nav className={adjacentClassName} aria-label="Post navigation">
        {olderPost ? (
          <a className="post-adjacent-link post-adjacent-link--previous" href={olderPost.route} aria-label={`${labels.previous}: ${olderPost.title}`}>
            <span className="post-adjacent-icon" aria-hidden="true">
              <Icon name="chevron-left" />
            </span>
            <span className="post-adjacent-copy">
              <span className="post-adjacent-label">{labels.previous}</span>
              <span className="post-adjacent-title">{olderPost.title}</span>
            </span>
          </a>
        ) : null}
        {newerPost ? (
          <a className="post-adjacent-link post-adjacent-link--next" href={newerPost.route} aria-label={`${labels.next}: ${newerPost.title}`}>
            <span className="post-adjacent-copy">
              <span className="post-adjacent-label">{labels.next}</span>
              <span className="post-adjacent-title">{newerPost.title}</span>
            </span>
            <span className="post-adjacent-icon" aria-hidden="true">
              <Icon name="chevron-right" />
            </span>
          </a>
        ) : null}
      </nav>
    </footer>
  );
}
