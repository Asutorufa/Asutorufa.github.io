import type { AppProps } from "../app/app-types";
import { Pagination } from "../components/Pagination";
import { UI_LABELS } from "../data/i18n";
import { formatDisplayDate } from "../utils/date";

type TaxonomyPageProps = AppProps & {
  type: "tag" | "category";
  name?: string;
  page?: number;
};

export function TaxonomyPage({ content, route, type, name, page = 1 }: TaxonomyPageProps) {
  const entries = type === "tag" ? content.tags : content.categories;
  const filteredPosts = name
    ? content.posts.filter((post) => (type === "tag" ? post.tags : post.categories).includes(name))
    : [];
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / content.config.perPage));
  const start = (page - 1) * content.config.perPage;
  const posts = filteredPosts.slice(start, start + content.config.perPage);
  const labels = UI_LABELS[route.language];
  const pluralTitle = type === "tag" ? labels.tags : labels.categories;
  const singularTitle = type === "tag" ? labels.tag : labels.category;

  if (!name) {
    return (
      <section className="content-card px-5 py-10 md:px-8 md:py-14 lg:px-10">
        <header className="mb-12 text-center">
          <h1 className="text-[1.7em] font-normal text-blog-heading">{pluralTitle}</h1>
        </header>
        {type === "tag" ? (
          <TagCloud entries={entries} labels={labels} />
        ) : (
          <CategoryList entries={entries} labels={labels} />
        )}
      </section>
    );
  }

  return (
    <>
      <section className="content-card px-5 py-10 md:px-8 md:py-14 lg:px-10">
        <div className="taxonomy-timeline">
          <header className="taxonomy-title">
            <h1>
              {name} <span>{singularTitle}</span>
            </h1>
          </header>
          {posts.map((post) => (
            <article key={post.abbrlink} className="taxonomy-entry">
              <time>{formatTaxonomyDate(post.date)}</time>
              <a href={post.route}>
                {post.title}
              </a>
            </article>
          ))}
        </div>
      </section>
      <Pagination currentPage={page} totalPages={totalPages} labels={labels} basePath={taxonomyBasePath(entries, name)} />
    </>
  );
}

function taxonomyBasePath(entries: Array<{ name: string; route: string }>, name: string) {
  return entries.find((entry) => entry.name === name)?.route ?? "/";
}

function formatTaxonomyDate(value?: string) {
  return formatDisplayDate(value).slice(5);
}

function TagCloud({ entries, labels }: { entries: Array<{ name: string; route: string; count: number }>; labels: typeof UI_LABELS[keyof typeof UI_LABELS] }) {
  const max = Math.max(...entries.map((entry) => entry.count), 1);
  const min = Math.min(...entries.map((entry) => entry.count), max);

  return (
    <div className="tag-cloud">
      <div className="tag-cloud-title">
        {labels.all} {entries.length} {labels.tag}
      </div>
      <div className="tag-cloud-tags">
        {entries.map((entry) => {
          const weight = tagWeight(entry.count, min, max);
          return (
            <a
              key={entry.name}
              href={entry.route}
              style={{
                color: tagColor(weight),
                fontSize: `${tagFontSize(weight)}px`,
                fontWeight: tagFontWeight(weight)
              }}
            >
              {entry.name}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function CategoryList({ entries, labels }: { entries: Array<{ name: string; route: string; count: number }>; labels: typeof UI_LABELS[keyof typeof UI_LABELS] }) {
  return (
    <div className="category-all-page">
      <div className="category-all-title">
        {labels.all} {entries.length} {labels.category}
      </div>
      <div className="category-all">
        <ul className="category-list">
          {entries.map((entry) => (
            <li key={entry.name} className="category-list-item">
              <a className="category-list-link" href={entry.route}>
                {entry.name}
              </a>
              <span className="category-list-count">{entry.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function tagWeight(count: number, min: number, max: number) {
  if (max === min) return 0;
  return (count - min) / (max - min);
}

function tagFontSize(weight: number) {
  return Number((12 + weight * 18).toFixed(2));
}

function tagFontWeight(weight: number) {
  if (weight > 0.78) return 500;
  if (weight > 0.45) return 400;
  return 300;
}

function tagColor(weight: number) {
  const dark = Math.round(204 - weight * 187);
  const value = dark.toString(16).padStart(2, "0");
  return `#${value}${value}${value}`;
}
