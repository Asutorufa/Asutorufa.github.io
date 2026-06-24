import { useEffect, useState } from "react";
import type { AppProps } from "../app/app-types";
import { ArticleContent } from "../components/ArticleContent";
import { Icon } from "../components/Icon";
import { UI_LABELS } from "../data/i18n";
import styles from "./PostPage.module.css";

type PostPageProps = AppProps & {
  abbrlink: string;
};

export function PostPage({ content, route, abbrlink }: PostPageProps) {
  const posts = route.kind === "wip-post" ? content.wipPosts : content.posts;
  const post = posts.find((item) => item.abbrlink === abbrlink);

  if (!post) {
    return <p>Post not found.</p>;
  }

  const labels = UI_LABELS[post.language];
  return <ArticleContent content={content} route={route} abbrlink={abbrlink} leading={<PostBackButton label={labels.back} />} />;
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
