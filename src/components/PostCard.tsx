import type { Post } from "../types/content";
import { UI_LABELS } from "../data/i18n";
import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { MotionPresets } from "../animation/motion-presets";
import { ArticleMarkdown } from "./ArticleMarkdown";
import { PostMeta } from "./PostMeta";
import styles from "./PostCard.module.css";

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const labels = UI_LABELS[post.language];
  const prefersReducedMotion = useReducedMotion();

  return (
    <article className="content-card mb-3 px-4 py-8 [contain:paint] md:mb-5 md:px-8 md:py-14 lg:px-10" data-scroll-route={post.route}>
      <header className="text-center">
        <h2 className="text-[1.7em] font-normal leading-normal text-blog-heading">
          <motion.a
            className={`${styles.titleLink} transition-colors`}
            href={post.route}
            whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.015 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
            transition={MotionPresets.fast}
          >
            {post.title}
          </motion.a>
        </h2>
        <PostMeta post={post} />
      </header>
      {post.excerptHtml ? (
        <div className="mt-8 md:mt-10">
          <ArticleMarkdown html={post.excerptHtml ?? ""} />
        </div>
      ) : null}
      <div className="mt-8 text-center md:mt-10">
        <motion.a
          className={clsx(styles.readMore, "read-more-button")}
          href={post.moreAnchor ? `${post.route}#${post.moreAnchor}` : post.route}
          whileHover={prefersReducedMotion ? undefined : "hover"}
          whileTap={prefersReducedMotion ? undefined : { y: 0, scale: 0.97 }}
          variants={{
            hover: {
              y: -2,
              scale: 1.025
            }
          }}
          transition={MotionPresets.fast}
        >
          <span>{labels.readMore}</span>
          <motion.span className={styles.readMoreIcon} aria-hidden="true" variants={{ hover: { x: 3 } }} transition={MotionPresets.fast}>
            »
          </motion.span>
        </motion.a>
      </div>
    </article>
  );
}
