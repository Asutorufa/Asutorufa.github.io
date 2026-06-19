import type { SVGProps } from "react";
import {
  Archive,
  ArrowUp,
  Calendar,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Check,
  CircleX,
  Clock3,
  Copy,
  Folder,
  Grid3X3,
  House,
  Mail,
  Monitor,
  Moon,
  Rss,
  Search,
  Sun,
  Tags,
  Trash2,
  User,
  Users,
  Wrench,
  type LucideIcon
} from "lucide-react";

export type IconName =
  | "angle-left"
  | "angle-right"
  | "archive"
  | "arrow-up"
  | "calendar"
  | "calendar-check"
  | "check"
  | "chevron-left"
  | "chevron-right"
  | "clock"
  | "close"
  | "copy"
  | "desktop"
  | "email"
  | "folder"
  | "github"
  | "home"
  | "moon"
  | "rss"
  | "search"
  | "sun"
  | "table"
  | "tags"
  | "trash"
  | "tools"
  | "user"
  | "users";

type IconProps = {
  name: IconName;
  className?: string;
};

const icons: Record<Exclude<IconName, "github">, LucideIcon> = {
  "angle-left": ChevronLeft,
  "angle-right": ChevronRight,
  archive: Archive,
  "arrow-up": ArrowUp,
  calendar: Calendar,
  "calendar-check": CalendarCheck,
  check: Check,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  clock: Clock3,
  close: CircleX,
  copy: Copy,
  desktop: Monitor,
  email: Mail,
  folder: Folder,
  home: House,
  moon: Moon,
  rss: Rss,
  search: Search,
  sun: Sun,
  table: Grid3X3,
  tags: Tags,
  trash: Trash2,
  tools: Wrench,
  user: User,
  users: Users
};

export function Icon({ name, className }: IconProps) {
  const mergedClassName = `inline-block h-[1em] w-[1em] shrink-0 align-[-0.125em] ${className ?? ""}`;

  if (name === "github") {
    return <GithubIcon className={mergedClassName} aria-hidden="true" focusable="false" />;
  }

  const Component = icons[name];
  return <Component className={mergedClassName} aria-hidden="true" focusable="false" size="1em" strokeWidth={2.5} />;
}

function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.51 0 12.3c0 5.44 3.44 10.04 8.21 11.67.6.11.82-.27.82-.59 0-.29-.01-1.06-.02-2.08-3.34.74-4.04-1.65-4.04-1.65-.55-1.42-1.33-1.8-1.33-1.8-1.09-.76.08-.74.08-.74 1.2.09 1.84 1.27 1.84 1.27 1.07 1.87 2.81 1.33 3.49 1.02.11-.79.42-1.33.76-1.64-2.67-.31-5.47-1.37-5.47-6.08 0-1.34.47-2.44 1.24-3.3-.12-.31-.54-1.56.12-3.25 0 0 1.01-.33 3.3 1.26A11.25 11.25 0 0 1 12 5.98c1.02 0 2.04.14 3 .41 2.29-1.59 3.3-1.26 3.3-1.26.66 1.69.24 2.94.12 3.25.77.86 1.24 1.96 1.24 3.3 0 4.72-2.81 5.77-5.49 6.07.43.38.81 1.12.81 2.26 0 1.63-.01 2.95-.01 3.35 0 .33.22.71.83.59A12.25 12.25 0 0 0 24 12.3C24 5.51 18.63 0 12 0Z" />
    </svg>
  );
}
