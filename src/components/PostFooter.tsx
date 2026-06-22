import clsx from "clsx";
import type { BlogConfig, Post, UiLabels } from "../types/content";
import { Icon } from "./Icon";
import styles from "./PostFooter.module.css";

type PostFooterProps = {
  config: BlogConfig;
  labels: UiLabels;
  post: Post;
  olderPost?: Post;
  newerPost?: Post;
};

export function PostFooter({ config, labels, post, olderPost, newerPost }: PostFooterProps) {
  const permalink = new URL(post.route, config.url).toString();
  const adjacentClassName = clsx(styles.adjacentNav, olderPost && newerPost && styles.adjacentPaired);

  return (
    <footer className="mt-10">
      <section className={styles.infoPanel}>
        <p className={styles.infoRow}>
          <span className={styles.infoLabel}>{labels.authorLabel}</span>
          <span className={styles.infoValue}>{config.author}</span>
        </p>
        <p className={styles.infoRow}>
          <span className={styles.infoLabel}>{labels.permalinkLabel}</span>
          <span className={styles.infoValue}>
            <a className={styles.infoLink} href={post.route}>
              {permalink}
            </a>
          </span>
        </p>
        <p className={styles.infoRow}>
          <span className={styles.infoLabel}>{labels.copyrightLabel}</span>
          <span className={styles.infoValue}>
            {labels.copyrightText}{" "}
            <a className={styles.infoLink} href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer">
              CC BY-NC-SA 4.0
            </a>
            .
          </span>
        </p>
      </section>

      <nav className={adjacentClassName} aria-label="Post navigation">
        {olderPost ? (
          <a className={styles.adjacentLink} href={olderPost.route} aria-label={`${labels.previous}: ${olderPost.title}`}>
            <span className={styles.adjacentIcon} aria-hidden="true">
              <Icon name="chevron-left" />
            </span>
            <span className={styles.adjacentCopy}>
              <span className={styles.adjacentLabel}>{labels.previous}</span>
              <span className={styles.adjacentTitle}>{olderPost.title}</span>
            </span>
          </a>
        ) : null}
        {newerPost ? (
          <a className={clsx(styles.adjacentLink, styles.adjacentNext)} href={newerPost.route} aria-label={`${labels.next}: ${newerPost.title}`}>
            <span className={styles.adjacentCopy}>
              <span className={styles.adjacentLabel}>{labels.next}</span>
              <span className={styles.adjacentTitle}>{newerPost.title}</span>
            </span>
            <span className={styles.adjacentIcon} aria-hidden="true">
              <Icon name="chevron-right" />
            </span>
          </a>
        ) : null}
      </nav>
    </footer>
  );
}
