import fs from "node:fs";
import path from "node:path";

/**
 * Generic Notion page-icon helpers.
 * SVGs live in public/notion-icons/{name}.svg (from the Notion icon pack).
 */

const NOTION_ICON_COLORS: Record<string, string> = {
  default: "#86868b",
  gray: "#86868b",
  brown: "#a2845e",
  orange: "#ff9500",
  yellow: "#ffd60a",
  green: "#34c759",
  blue: "#2997ff",
  purple: "#bf5af2",
  pink: "#ff2d55",
  red: "#ff453a",
};

const DEFAULT_ICON = "sparkle";

const ICONS_DIR = path.join(process.cwd(), "public", "notion-icons");

function loadAvailableIcons(): Set<string> {
  try {
    return new Set(
      fs
        .readdirSync(ICONS_DIR)
        .filter((f) => f.endsWith(".svg"))
        .map((f) => f.slice(0, -4)),
    );
  } catch {
    return new Set();
  }
}

const AVAILABLE = loadAvailableIcons();

/** Resolve a Notion icon name to a file that exists locally. */
export function resolveNotionIconName(name: string | null | undefined): string {
  if (name && AVAILABLE.has(name)) return name;
  if (AVAILABLE.has(DEFAULT_ICON)) return DEFAULT_ICON;
  // Last resort: first available icon, or a known pack name.
  const first = AVAILABLE.values().next().value;
  return first ?? DEFAULT_ICON;
}

/** Public URL for a Notion icon SVG. */
export function notionIconUrl(name: string | null | undefined): string {
  return `/notion-icons/${resolveNotionIconName(name)}.svg`;
}

/** Accent hex from Notion icon color token (e.g. "gray" → gray). */
export function resolveNotionIconAccent(
  _iconName: string | null | undefined,
  iconColor: string | null | undefined,
): string {
  const colorKey = iconColor ?? "gray";
  return NOTION_ICON_COLORS[colorKey] ?? NOTION_ICON_COLORS.gray;
}
