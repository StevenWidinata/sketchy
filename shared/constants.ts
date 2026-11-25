export const LIMITS = {
  nameMax: 20,
  chatMax: 100,
  wordMax: 32,
  customWordsMax: 200,
  roomCodeLength: 5,
  playersMin: 2,
  playersMax: 20,
  /** Max number of point coordinates (x and y count separately) stored per turn. */
  pointsPerTurn: 60_000,
  /** Max coordinates in a single draw message. */
  pointsPerMessage: 400,
  actionsPerTurn: 3_000,
  galleryMax: 24,
  /** Cap on stored gallery coordinates per room, so one room cannot hold huge drawings in memory. */
  galleryPoints: 400_000,
} as const;

export const TIMING = {
  chooseSeconds: 15,
  revealSeconds: 6,
  reconnectGraceSeconds: 30,
} as const;

export const SETTING_OPTIONS = {
  rounds: [2, 3, 4, 5, 6, 7, 8],
  drawTime: [60, 80, 100, 120],
  wordChoices: [2, 3, 4],
} as const;

export const DEFAULT_SETTINGS = {
  rounds: 3,
  drawTime: 80,
  wordChoices: 3,
  maxPlayers: 10,
  language: "en",
  categories: [] as string[], // empty = all categories
  customWords: [] as string[],
  customOnly: false,
} as const;

/** The drawing surface always has this internal size, on every device, so fills replay identically. */
export const CANVAS = { width: 1200, height: 900 } as const;

export const PALETTE = [
  "#16171c", "#ffffff", "#8a8d96", "#c9c6bd",
  "#e5372f", "#ff8a3d", "#ffd23f", "#d4ff3f",
  "#3fbf5f", "#1f8a70", "#3fa9f5", "#2347d8",
  "#8b5cf6", "#f472b6", "#8b5a2b", "#f2c9a0",
] as const;

export const BRUSH_SIZES = [4, 10, 22, 44] as const;

export const AVATAR_COLORS = [
  "#d4ff3f", "#ff8a3d", "#3fa9f5", "#f472b6",
  "#ffd23f", "#3fbf5f", "#8b5cf6", "#e5372f",
] as const;

export const SCORING = {
  guessBase: 50,
  guessSpeed: 450,
  orderBonus: [50, 25, 10],
  drawerMax: 300,
} as const;
