import { AVATAR_COLORS } from "../../../shared/constants";

export interface Accent {
  /** Button and highlight fill. */
  fill: string;
  /** Text on the fill, 4.5:1 or better. */
  on: string;
  /** A darker shade for text and outlines on paper, 4.5:1 or better on white. */
  ink: string;
}

const INK = "#1d2340";
const WHITE = "#ffffff";

/** Checked by hand against #ffffff and #fefdfb (see the contrast notes in the redesign plan). */
const TABLE: Record<(typeof AVATAR_COLORS)[number], Accent> = {
  "#d4ff3f": { fill: "#d4ff3f", on: INK, ink: "#5a7608" },
  "#ff8a3d": { fill: "#ff8a3d", on: INK, ink: "#b3541a" },
  "#3fa9f5": { fill: "#3fa9f5", on: INK, ink: "#1f6fb0" },
  "#f472b6": { fill: "#f472b6", on: INK, ink: "#b8417f" },
  "#ffd23f": { fill: "#ffd23f", on: INK, ink: "#8a6a00" },
  "#3fbf5f": { fill: "#3fbf5f", on: INK, ink: "#23803f" },
  "#8b5cf6": { fill: "#8558ec", on: WHITE, ink: "#7650dc" },
  "#e5372f": { fill: "#d8332c", on: WHITE, ink: "#cc3029" },
};

const FALLBACK = TABLE["#3fa9f5"];

export function accentFor(color: string | undefined): Accent {
  return (color && TABLE[color as keyof typeof TABLE]) || FALLBACK;
}

/** Text color that reads on a player's color, for avatars and filled blocks. */
export function onColor(color: string): string {
  return accentFor(color).on;
}

let current = "";

/** Makes this color the page accent: primary buttons, selections, focus rings and your doodles. */
export function applyAccent(color: string | undefined) {
  const a = accentFor(color);
  if (a.fill === current) return;
  current = a.fill;
  const s = document.documentElement.style;
  s.setProperty("--accent", a.fill);
  s.setProperty("--on-accent", a.on);
  s.setProperty("--accent-ink", a.ink);
}

export function currentAccent(): string {
  return current || FALLBACK.fill;
}
