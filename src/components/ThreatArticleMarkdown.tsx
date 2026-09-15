import { ArticleMarkdown } from "./ArticleMarkdown";
import styles from "./ThreatArticleMarkdown.module.css";

type ThreatArticleMarkdownProps = {
  html: string;
};

export function ThreatArticleMarkdown({ html }: ThreatArticleMarkdownProps) {
  return (
    <div className={styles.root} data-threat-article="">
      <ArticleMarkdown html={html} />
    </div>
  );
}
