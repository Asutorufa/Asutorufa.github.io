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
    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-normal text-[#999]">
      <span>
        <Icon name="calendar" className="mr-2" />
        {labels.postedOn} {formatDisplayDate(post.date)}
      </span>
      <span className="hidden text-neutral-300 sm:inline">|</span>
      <span>
        <Icon name="calendar-check" className="mr-2" />
        {labels.modified} {formatDisplayDate(post.updated ?? post.date)}
      </span>
      {post.categories.length > 0 ? (
        <>
          <span className="hidden text-neutral-300 sm:inline">|</span>
          <span>
            <Icon name="folder" className="mr-2" />
            {labels.inCategory}{" "}
            {post.categories.map((category, index) => (
              <span key={category}>
                <a className="border-b border-neutral-400 text-neutral-600" href={taxonomyRoute("categories", category)}>
                  {category}
                </a>
                {index < post.categories.length - 1 ? ", " : ""}
              </span>
            ))}
          </span>
        </>
      ) : null}
    </div>
  );
}
