import type { IconType } from "react-icons";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCode,
  FiCpu,
  FiDatabase,
  FiDownload,
  FiExternalLink,
  FiFile,
  FiFileText,
  FiGitBranch,
  FiGlobe,
  FiImage,
  FiInfo,
  FiLayers,
  FiLink,
  FiLock,
  FiMail,
  FiMap,
  FiMonitor,
  FiPlay,
  FiSearch,
  FiSettings,
  FiStar,
  FiTag,
  FiTerminal,
  FiUsers,
  FiVideo,
  FiZap,
} from "react-icons/fi";

/**
 * The icon vocabulary available to authors via `::artifact_b{icon=…}`.
 *
 * Deliberately a literal object with static imports — never a dynamic
 * `import("react-icons/fi/" + name)`. A literal map is the only form a bundler
 * can tree-shake, so adding a 33rd entry here costs one icon, not the whole
 * 4,000-icon pack. Adding a new icon means editing this file; that is the
 * point, since it keeps the author-facing vocabulary reviewable.
 */
export const ICONS = {
  alert: FiAlertTriangle,
  book: FiBookOpen,
  calendar: FiCalendar,
  chart: FiBarChart2,
  check: FiCheckCircle,
  clock: FiClock,
  code: FiCode,
  computer: FiMonitor,
  cpu: FiCpu,
  database: FiDatabase,
  doc: FiFileText,
  download: FiDownload,
  external: FiExternalLink,
  file: FiFile,
  git: FiGitBranch,
  image: FiImage,
  info: FiInfo,
  layers: FiLayers,
  link: FiLink,
  lock: FiLock,
  mail: FiMail,
  map: FiMap,
  people: FiUsers,
  play: FiPlay,
  search: FiSearch,
  settings: FiSettings,
  star: FiStar,
  tag: FiTag,
  terminal: FiTerminal,
  video: FiVideo,
  world: FiGlobe,
  zap: FiZap,
} as const satisfies Record<string, IconType>;

export type IconName = keyof typeof ICONS;

/** All valid icon names, for docs and error messages. */
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

/** Looks up an icon, falling back to `file` for unknown names. */
export function resolveIcon(name: unknown): IconType {
  if (typeof name === "string" && name in ICONS) {
    return ICONS[name as IconName];
  }
  return ICONS.file;
}
