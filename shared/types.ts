export type Language = "en" | "id";

export type Difficulty = "easy" | "medium" | "hard";

/** Classic turns use the host's draw time; a Speed round is 30 s a turn with earlier hints. */
export type GameMode = "classic" | "speed";

export type Phase = "lobby" | "choosing" | "drawing" | "reveal" | "podium";

export interface Settings {
  rounds: number;
  drawTime: number;
  wordChoices: number;
  maxPlayers: number;
  language: Language;
  /** Category ids. Empty means every category. */
  categories: string[];
  customWords: string[];
  customOnly: boolean;
  mode: GameMode;
}

export interface PublicPlayer {
  id: string;
  name: string;
  color: string;
  score: number;
  connected: boolean;
  /** Guessed the word in the current turn. */
  guessed: boolean;
  /** Points gained in the current or last turn. */
  gain: number;
}

export interface WordHint {
  categoryId: string;
  /** One entry per character: a revealed letter, "_" for hidden, or the separator itself (space, hyphen). */
  pattern: string[];
}

export interface RoomState {
  code: string;
  /** Increases with every saved change; clients ignore older states. */
  rev: number;
  /** Increases every turn; realtime channel names include it. */
  turnId: number;
  phase: Phase;
  settings: Settings;
  players: PublicPlayer[];
  hostId: string;
  round: number;
  drawerId: string | null;
  /** Epoch ms at which the current phase ends; null in lobby/podium. */
  phaseEndsAt: number | null;
  phaseDuration: number;
  /** When hint letters are revealed (epoch ms), so clients can ask for the update on time. */
  hintTimes: number[];
  /** Server clock when this state was sent, so clients can correct for clock skew. */
  serverNow: number;
  hint: WordHint | null;
  /** The answer, only during reveal. */
  revealWord: string | null;
  /** How hard the revealed word was, only during reveal. */
  revealDifficulty: Difficulty | null;
  reactions: { likes: number; dislikes: number };
  /** Why the last turn ended; shown on the reveal card. */
  endReason: "all-guessed" | "time-up" | "drawer-left" | null;
}

export interface WordChoice {
  word: string;
  categoryId: string;
  /** Missing for custom words, which play as medium without a label. */
  difficulty?: Difficulty;
}

export type Tool = "pen" | "eraser";

export type DrawAction =
  | { kind: "stroke"; id: string; color: string; size: number; tool: Tool; points: number[] }
  | { kind: "fill"; id: string; x: number; y: number; color: string }
  | { kind: "clear"; id: string };

export interface ChatLine {
  id: string;
  kind: "chat" | "system" | "correct" | "close";
  playerId?: string;
  name?: string;
  color?: string;
  text: string;
  /** Visible only to players who already guessed (and the drawer). */
  solvedOnly?: boolean;
}

export interface GalleryItem {
  id: string;
  drawerName: string;
  drawerColor: string;
  word: string;
  categoryId: string;
  actions: DrawAction[];
}

export type StrokeAction = Extract<DrawAction, { kind: "stroke" }>;

/** Live drawing events, sent by the drawer straight to other players over Supabase Realtime. */
export type DrawEvent =
  | { t: "begin"; action: StrokeAction }
  | { t: "points"; id: string; points: number[] }
  | { t: "fill"; action: Extract<DrawAction, { kind: "fill" }> }
  | { t: "clear"; action: Extract<DrawAction, { kind: "clear" }> }
  | { t: "undo" };

/** Requests to POST /api/game. Every request carries the player's Supabase access token. */
export type ApiRequest =
  | { action: "create"; name: string; color: string }
  | { action: "join"; code: string; name: string; color: string }
  | { action: "sync"; code: string }
  | { action: "leave"; code: string }
  | { action: "settings"; code: string; settings: Partial<Settings> }
  | { action: "start"; code: string }
  | { action: "again"; code: string }
  | { action: "choose"; code: string; index: number }
  | { action: "chat"; code: string; text: string }
  | { action: "react"; code: string; kind: "like" | "dislike" }
  | { action: "drawing"; code: string }
  | { action: "drawSync"; code: string; turnId: number; keep: number; append: DrawAction[] }
  | { action: "gallery"; code: string };

export interface PrivateView {
  choices?: WordChoice[];
  word?: WordChoice;
}

export type ApiResponse =
  | {
      ok: true;
      state?: RoomState;
      you?: string;
      private?: PrivateView;
      lines?: ChatLine[];
      actions?: DrawAction[];
      gallery?: GalleryItem[];
    }
  | { ok: false; message: string };
