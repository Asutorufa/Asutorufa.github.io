import type { BlogConfig, Post, UiLabels } from "../types/content";
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
    <footer className="mt-10">
      <section className="post-info-panel">
        <p className="post-info-row">
          <span className="post-info-label">{labels.authorLabel}</span>
          <span className="post-info-value">{config.author}</span>
        </p>
        <p className="post-info-row">
          <span className="post-info-label">{labels.permalinkLabel}</span>
          <span className="post-info-value">
            <a className="post-info-link" href={post.route}>
              {permalink}
            </a>
          </span>
        </p>
        <p className="post-info-row">
          <span className="post-info-label">{labels.copyrightLabel}</span>
          <span className="post-info-value">
            {labels.copyrightText}{" "}
            <a className="post-info-link" href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer">
              CC BY-NC-SA 4.0
            </a>
            .
          </span>
        </p>
      </section>

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
