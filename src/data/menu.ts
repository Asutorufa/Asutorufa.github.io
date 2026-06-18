import type { UiLabels } from "../types/content";
import type { IconName } from "../components/Icon";

type MenuItem = {
  href: string;
  label: string;
  icon: IconName;
};

export function menuItems(labels: UiLabels): MenuItem[] {
  return [
    { href: "/", label: labels.home, icon: "home" },
    { href: "/tags/", label: labels.tags, icon: "tags" },
    { href: "/categories/", label: labels.categories, icon: "table" },
    { href: "/archives/", label: labels.archives, icon: "archive" },
    { href: "/about/", label: labels.about, icon: "user" },
    { href: "/friends/", label: labels.friends, icon: "users" },
    { href: "#search", label: labels.search, icon: "search" }
  ];
}
