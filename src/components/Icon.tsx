import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons/faAngleLeft";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons/faArrowUp";
import { faBoxArchive } from "@fortawesome/free-solid-svg-icons/faBoxArchive";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons/faCircleXmark";
import { faDesktop } from "@fortawesome/free-solid-svg-icons/faDesktop";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons/faEnvelope";
import { faHouse } from "@fortawesome/free-solid-svg-icons/faHouse";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons/faMagnifyingGlass";
import { faRss } from "@fortawesome/free-solid-svg-icons/faRss";
import { faTableCells } from "@fortawesome/free-solid-svg-icons/faTableCells";
import { faTags } from "@fortawesome/free-solid-svg-icons/faTags";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import { faCalendar } from "@fortawesome/free-regular-svg-icons/faCalendar";
import { faCalendarCheck } from "@fortawesome/free-regular-svg-icons/faCalendarCheck";
import { faFolder } from "@fortawesome/free-regular-svg-icons/faFolder";
import { faMoon } from "@fortawesome/free-regular-svg-icons/faMoon";
import { faSun } from "@fortawesome/free-regular-svg-icons/faSun";
import { faGithub } from "@fortawesome/free-brands-svg-icons/faGithub";

export type IconName =
  | "angle-left"
  | "angle-right"
  | "archive"
  | "arrow-up"
  | "calendar"
  | "calendar-check"
  | "chevron-left"
  | "chevron-right"
  | "close"
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
  | "user"
  | "users";

type IconProps = {
  name: IconName;
  className?: string;
};

const icons: Record<IconName, IconDefinition> = {
  "angle-left": faAngleLeft,
  "angle-right": faAngleRight,
  archive: faBoxArchive,
  "arrow-up": faArrowUp,
  calendar: faCalendar,
  "calendar-check": faCalendarCheck,
  "chevron-left": faChevronLeft,
  "chevron-right": faChevronRight,
  close: faCircleXmark,
  desktop: faDesktop,
  email: faEnvelope,
  folder: faFolder,
  github: faGithub,
  home: faHouse,
  moon: faMoon,
  rss: faRss,
  search: faMagnifyingGlass,
  sun: faSun,
  table: faTableCells,
  tags: faTags,
  user: faUser,
  users: faUsers
};

export function Icon({ name, className }: IconProps) {
  return <FontAwesomeIcon icon={icons[name]} className={className} aria-hidden="true" />;
}
