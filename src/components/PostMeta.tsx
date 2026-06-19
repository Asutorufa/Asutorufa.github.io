import { UI_LABELS } from "../data/i18n";
import type { Post } from "../types/content";
import { formatDisplayDate } from "../utils/date";
import { taxonomyRoute } from "../utils/route";
import { Icon } from "./Icon";

type PostMetaProps = {
  post: Post;
};

export function PostMeta({ post }: PostMetaProps) {
  const labels = UI_LABELS[post.language];

  return (
    <div className="post-meta">
      <div className="post-meta-line">
        <span>
          <Icon name="calendar" className="mr-2" />
          {labels.postedOn} {formatDisplayDate(post.date)}
        </span>
        <span className="post-meta-separator">|</span>
        <span>
          <Icon name="calendar-check" className="mr-2" />
          {labels.modified} {formatDisplayDate(post.updated ?? post.date)}
        </span>
        {post.categories.length > 0 ? (
          <>
            <span className="post-meta-separator">|</span>
            <span>
              <Icon name="folder" className="mr-2" />
              {labels.inCategory}{" "}
              {post.categories.map((category, index) => (
                <span key={category}>
                  <a className="post-meta-link" href={taxonomyRoute("categories", category)}>
                    {category}
                  </a>
                  {index < post.categories.length - 1 ? ", " : ""}
                </span>
              ))}
            </span>
          </>
        ) : null}
      </div>
      {post.tags.length > 0 ? (
        <nav className="post-meta-tags" aria-label="Tags">
          {post.tags.map((tag) => (
            <a key={tag} className="post-meta-tag" href={taxonomyRoute("tags", tag)}>
              # {tag}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
