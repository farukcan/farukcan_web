/**
 * Notion native page icons use Lucide-like names + a color token.
 * Map those to SVG path data and accent hex for the Services cards.
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

/** When Notion leaves color as gray, give each icon family a distinct accent. */
const ICON_ACCENT_FALLBACK: Record<string, string> = {
  code: "#ff9500",
  robot: "#bf5af2",
  database: "#34c759",
  computer: "#2997ff",
  bug: "#ff453a",
  puzzle: "#ff2d55",
  shield: "#ff6b4a",
};

/** Lucide-style 24×24 stroke paths (viewBox 0 0 24 24). */
const ICON_PATHS: Record<string, string[]> = {
  code: ["M16 18l6-6-6-6", "M8 6l-6 6 6 6"],
  robot: [
    "M12 8V4H8",
    "M2 14a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2z",
    "M9 13h.01",
    "M15 13h.01",
    "M9 18v2",
    "M15 18v2",
  ],
  database: [
    "M12 5c4.97 0 9 1.34 9 3s-4.03 3-9 3-9-1.34-9-3 4.03-3 9-3z",
    "M3 8v8c0 1.66 4.03 3 9 3s9-1.34 9-3V8",
    "M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3",
  ],
  computer: [
    "M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9",
    "M4 16h16",
    "M2 20h20",
  ],
  bug: [
    "M8 2l1.88 1.88",
    "M14.12 3.88 16 2",
    "M9 7.13V6a3 3 0 1 1 6 0v1.13",
    "M12 20c-3.3 0-6-2.7-6-6v-3a6 6 0 0 1 12 0v3c0 3.3-2.7 6-6 6z",
    "M12 20v-9",
    "M6.53 9A4 4 0 0 0 4 12.5",
    "M17.47 9A4 4 0 0 1 20 12.5",
    "M3 13h2",
    "M19 13h2",
  ],
  puzzle: [
    "M19.439 12.955l.014.015a2.02 2.02 0 0 1 0 2.858l-2.576 2.575a2.02 2.02 0 0 1-2.858 0l-.015-.014",
    "M4.561 11.045l-.014-.015a2.02 2.02 0 0 1 0-2.858l2.576-2.575a2.02 2.02 0 0 1 2.858 0l.015.014",
    "M12 5.5V5a2.5 2.5 0 0 0-5 0v.5",
    "M12 18.5V19a2.5 2.5 0 0 0 5 0v-.5",
    "M18.5 12H19a2.5 2.5 0 0 0 0-5h-.5",
    "M5.5 12H5a2.5 2.5 0 0 0 0 5h.5",
  ],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  sparkles: [
    "m12 3 1.912 5.813L20 12l-6.088 2.187L12 20l-1.912-5.813L4 12l6.088-2.187L12 3Z",
    "M5 3v4",
    "M19 17v4",
    "M3 5h4",
    "M17 19h4",
  ],
};

export function resolveServiceIconAccent(
  iconName: string | null,
  iconColor: string,
): string {
  const named = NOTION_ICON_COLORS[iconColor];
  if (iconColor !== "gray" && iconColor !== "default" && named) return named;
  if (iconName && ICON_ACCENT_FALLBACK[iconName]) {
    return ICON_ACCENT_FALLBACK[iconName];
  }
  return named ?? NOTION_ICON_COLORS.gray;
}

export function serviceIconPaths(iconName: string | null): string[] {
  if (iconName && ICON_PATHS[iconName]) return ICON_PATHS[iconName];
  return ICON_PATHS.sparkles;
}
