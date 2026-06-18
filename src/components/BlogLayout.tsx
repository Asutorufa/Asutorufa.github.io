import type { PropsWithChildren } from "react";
import type { AppProps } from "../app/app-types";
import { LANGUAGE_META, UI_LABELS } from "../data/i18n";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { SearchModal } from "./SearchModal";
import { SiteFooter } from "./SiteFooter";

export function BlogLayout({ content, route, children }: PropsWithChildren<AppProps>) {
  const language = route.language;
  const labels = UI_LABELS[language];
  const meta = LANGUAGE_META[language];
  const currentPost = route.params?.abbrlink ? content.posts.find((post) => post.abbrlink === route.params?.abbrlink) : undefined;

  return (
    <div className="site-shell min-h-screen bg-[#f7f7f7] text-neutral-800" dir={meta.textDirection}>
      <MobileHeader labels={labels} title={content.config.title} subtitle={content.config.subtitle} currentRoute={route.route} />
      <div className="mx-auto flex w-full max-w-[1680px] gap-5 px-2 py-2 md:px-5 lg:items-stretch lg:px-8 lg:py-7">
        <main className="min-w-0 flex-1">{children}</main>
        <aside className="hidden w-[240px] shrink-0 self-stretch lg:block">
          <Sidebar content={content} labels={labels} currentRoute={route.route} post={currentPost} />
        </aside>
      </div>
      <SiteFooter config={content.config} />
      <SearchModal labels={labels} />
    </div>
  );
}
