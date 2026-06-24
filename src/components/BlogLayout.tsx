import type { PropsWithChildren } from "react";
import { MotionConfig } from "motion/react";
import type { AppProps } from "../app/app-types";
import { LANGUAGE_META, UI_LABELS } from "../data/i18n";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { RouteLoading } from "./RouteLoading";
import { ScrollProgressButton } from "./ScrollProgressButton";
import { SearchModal } from "./SearchModal";
import { SiteFooter } from "./SiteFooter";

type BlogLayoutProps = PropsWithChildren<
  AppProps & {
    routeLoading?: boolean;
  }
>;

export function BlogLayout({ content, route, routeLoading = false, children }: BlogLayoutProps) {
  const language = route.language;
  const labels = UI_LABELS[language];
  const meta = LANGUAGE_META[language];
  const currentPosts = route.kind === "wip-post" ? content.wipPosts : content.posts;
  const currentPost = route.params?.abbrlink ? currentPosts.find((post) => post.abbrlink === route.params?.abbrlink) : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <div className="site-shell min-h-screen bg-blog-bg text-blog-text" dir={meta.textDirection}>
        <MobileHeader labels={labels} title={content.config.title} subtitle={content.config.subtitle} currentRoute={route.route} />
        <div className="mx-auto flex w-full max-w-[1680px] gap-5 px-2 py-2 md:px-5 lg:items-stretch lg:px-8 lg:py-7">
          <main className="min-w-0 flex-1">{children}</main>
          <aside className="hidden w-[240px] shrink-0 self-stretch lg:block">
            <Sidebar content={content} labels={labels} currentRoute={route.route} post={currentPost} />
          </aside>
        </div>
        <SiteFooter config={content.config} />
        <ScrollProgressButton />
        <SearchModal labels={labels} />
        <RouteLoading active={routeLoading} />
      </div>
    </MotionConfig>
  );
}
