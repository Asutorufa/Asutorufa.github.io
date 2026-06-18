import { Router } from "wouter";
import type { AppProps } from "./app-types";
import { BlogLayout } from "../components/BlogLayout";
import { UI_LABELS } from "../data/i18n";
import { ArchivePage } from "../pages/ArchivePage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PageView } from "../pages/PageView";
import { PostPage } from "../pages/PostPage";
import { TaxonomyPage } from "../pages/TaxonomyPage";

export function App(props: AppProps) {
  return (
    <Router ssrPath={props.route.route}>
      <BlogLayout {...props}>{renderRoute(props)}</BlogLayout>
    </Router>
  );
}

function renderRoute(props: AppProps) {
  const { route } = props;
  const labels = UI_LABELS[route.language];

  switch (route.kind) {
    case "home":
      return <HomePage {...props} page={Number(route.params?.page ?? "1")} />;
    case "post":
      return <PostPage {...props} abbrlink={route.params?.abbrlink ?? ""} />;
    case "page":
      return <PageView {...props} />;
    case "archives":
    case "archive-year":
    case "archive-month":
    case "archives-page":
    case "archive-year-page":
    case "archive-month-page":
      return <ArchivePage {...props} year={route.params?.year} month={route.params?.month} page={Number(route.params?.page ?? "1")} />;
    case "tags":
    case "tag":
    case "tag-page":
      return <TaxonomyPage {...props} type="tag" name={route.params?.tag} page={Number(route.params?.page ?? "1")} />;
    case "categories":
    case "category":
    case "category-page":
      return <TaxonomyPage {...props} type="category" name={route.params?.category} page={Number(route.params?.page ?? "1")} />;
    case "not-found":
      return <NotFoundPage labels={labels} />;
    default:
      return <NotFoundPage labels={labels} />;
  }
}
