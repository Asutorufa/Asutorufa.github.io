import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { AppProps } from "../app/app-types";
import { MotionPresets } from "../animation/motion-presets";
import { ArticleMarkdown } from "../components/ArticleMarkdown";
import { GitalkComments } from "../components/GitalkComments";
import { Icon } from "../components/Icon";
import { PostFooter } from "../components/PostFooter";
import { PostMeta } from "../components/PostMeta";
import { UI_LABELS } from "../data/i18n";
import styles from "./PostPage.module.css";

type PostPageProps = AppProps & {
  abbrlink: string;
};

export function PostPage({ content, route, abbrlink }: PostPageProps) {
  const posts = route.kind === "wip-post" ? content.wipPosts : content.posts;
  const index = posts.findIndex((item) => item.abbrlink === abbrlink);
  const post = posts[index];
  const prefersReducedMotion = useReducedMotion();

  if (!post) {
    return <p>Post not found.</p>;
  }

  const labels = UI_LABELS[post.language];
  const newerPost = index > 0 ? posts[index - 1] : undefined;
  const olderPost = index < posts.length - 1 ? posts[index + 1] : undefined;
  const showComments = route.kind === "post" && post.comments;
  const titleInitial = { opacity: 0 };
  const titleAnimate = { opacity: 1 };
  const metaInitial = prefersReducedMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 8 };
  const metaAnimate = { opacity: 1, y: 0 };

  return (
    <>
      <motion.article className="content-card px-4 py-8 [contain:paint] md:px-8 md:py-14 lg:px-10">
        <PostBackButton label={labels.back} />
        <header className="mb-12 text-center md:mb-16">
          <motion.h1
            className="text-[1.7em] font-normal leading-normal text-blog-heading"
            initial={titleInitial}
            animate={titleAnimate}
            transition={MotionPresets.normal}
          >
            {post.title}
          </motion.h1>
          <motion.div initial={metaInitial} animate={metaAnimate} transition={{ ...MotionPresets.normal, delay: prefersReducedMotion ? 0 : 0.08 }}>
            <PostMeta post={post} />
          </motion.div>
        </header>
        <ArticleMarkdown html={post.bodyHtml} />
        <PostFooter config={content.config} labels={labels} post={post} olderPost={olderPost} newerPost={newerPost} />
      </motion.article>
      {showComments ? (
        <section id="comments" className="content-card mt-4 overflow-hidden px-4 py-5 md:mt-6 md:px-8 md:py-7 lg:px-10">
          <GitalkComments id={post.route} language={post.language} />
        </section>
      ) : null}
    </>
  );
}

function PostBackButton({ label }: { label: string }) {
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const update = () => setCanGoBack(canUseHistoryBack());
    update();
    window.addEventListener("asutorufa-route-change", update);
    return () => window.removeEventListener("asutorufa-route-change", update);
  }, []);

  if (!canGoBack) return null;

  return (
    <button type="button" className={styles.backButton} onClick={() => window.history.back()} aria-label={label}>
      <Icon name="chevron-left" className={styles.backIcon} />
      <span>{label}</span>
    </button>
  );
}

function canUseHistoryBack() {
  if (typeof window === "undefined") return false;
  const state = window.history.state as { canGoBack?: unknown } | null;
  return state?.canGoBack === true;
}
