import { UI_LABELS } from "../data/i18n";
import type { Post } from "../types/content";
import { formatDisplayDate } from "../utils/date";
import { taxonomyRoute } from "../utils/route";
import { Icon } from "./Icon";
import styles from "./PostMeta.module.css";

type PostMetaProps = {
  post: Post;
};

export function PostMeta({ post }: PostMetaProps) {
  const labels = UI_LABELS[post.language];
  const showTaxonomy = !post.wip;

  return (
    <div className={styles.root}>
      <div className={styles.line}>
        <span>
          <Icon name="calendar" className="mr-2" />
          {labels.postedOn} {formatDisplayDate(post.date)}
        </span>
        <span className={styles.separator}>|</span>
        <span>
          <Icon name="calendar-check" className="mr-2" />
          {labels.modified} {formatDisplayDate(post.updated ?? post.date)}
        </span>
        {showTaxonomy && post.categories.length > 0 ? (
          <>
            <span className={styles.separator}>|</span>
            <span>
              <Icon name="folder" className="mr-2" />
              {labels.inCategory}{" "}
              {post.categories.map((category, index) => (
                <span key={category}>
                  <a className={styles.link} href={taxonomyRoute("categories", category)}>
                    {category}
                  </a>
                  {index < post.categories.length - 1 ? ", " : ""}
                </span>
              ))}
            </span>
          </>
        ) : null}
      </div>
      {showTaxonomy && post.tags.length > 0 ? (
        <nav className={styles.tags} aria-label="Tags">
          {post.tags.map((tag) => (
            <a key={tag} className={styles.tag} href={taxonomyRoute("tags", tag)}>
              # {tag}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
