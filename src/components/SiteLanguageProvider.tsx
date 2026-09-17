import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { UI_LABELS } from "../data/i18n";
import type { RouteEntry, SiteLanguage, UiLabels } from "../types/content";
import { preferredSiteLanguage, SITE_LANGUAGE_CHANGE_EVENT } from "../utils/language";

const SiteLanguageContext = createContext<SiteLanguage | undefined>(undefined);

type SiteLanguageProviderProps = PropsWithChildren<{
  route: Pick<RouteEntry, "kind" | "language">;
}>;

export function SiteLanguageProvider({ route, children }: SiteLanguageProviderProps) {
  const routeOwnsLanguage = isThreatRoute(route.kind);
  const [language, setLanguage] = useState<SiteLanguage>(route.language);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(routeOwnsLanguage ? route.language : preferredSiteLanguage());
    };

    syncLanguage();
    window.addEventListener(SITE_LANGUAGE_CHANGE_EVENT, syncLanguage);
    return () => window.removeEventListener(SITE_LANGUAGE_CHANGE_EVENT, syncLanguage);
  }, [route.language, routeOwnsLanguage]);

  return <SiteLanguageContext.Provider value={routeOwnsLanguage ? route.language : language}>{children}</SiteLanguageContext.Provider>;
}

export function useSiteLanguage(fallbackLanguage: SiteLanguage = "en") {
  return useContext(SiteLanguageContext) ?? fallbackLanguage;
}

export function useSiteLabels(fallbackLanguage?: SiteLanguage): UiLabels {
  return UI_LABELS[useSiteLanguage(fallbackLanguage)];
}

function isThreatRoute(kind: RouteEntry["kind"]) {
  return kind === "threats" || kind === "threats-page" || kind === "threat-report";
}
