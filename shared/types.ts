export type Language = "en" | "id";

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
  phase: Phase;
  settings: Settings;
  players: PublicPlayer[];
  hostId: string;
  round: number;
  drawerId: string | null;
  /** Epoch ms at which the current phase ends; null in lobby/podium. */
  phaseEndsAt: number | null;
  phaseDuration: number;
  /** Server clock when this state was sent, so clients can correct for clock skew. */
  serverNow: number;
  hint: WordHint | null;
  /** The answer, only during reveal. */
  revealWord: string | null;
  reactions: { likes: number; dislikes: number };
  /** Why the last turn ended; shown on the reveal card. */
  endReason: "all-guessed" | "time-up" | "drawer-left" | null;
}

export interface WordChoice {
  word: string;
  categoryId: string;
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

export interface ServerToClient {
  "room:state": (state: RoomState) => void;
  "room:you": (you: { playerId: string }) => void;
  "room:error": (error: { message: string }) => void;
  "turn:choices": (choices: WordChoice[]) => void;
  "turn:word": (word: { word: string; categoryId: string }) => void;
  "chat:line": (line: ChatLine) => void;
  "draw:sync": (actions: DrawAction[]) => void;
  "draw:begin": (action: Extract<DrawAction, { kind: "stroke" }>) => void;
  "draw:points": (data: { id: string; points: number[] }) => void;
  "draw:fill": (action: Extract<DrawAction, { kind: "fill" }>) => void;
  "draw:clear": (action: Extract<DrawAction, { kind: "clear" }>) => void;
  "draw:undo": () => void;
  "game:gallery": (items: GalleryItem[]) => void;
}

export interface JoinPayload {
  code?: string;
  name: string;
  color: string;
  sessionId: string;
}

export type Ack = (result: { ok: true; code: string } | { ok: false; message: string }) => void;

export interface ClientToServer {
  "room:create": (payload: JoinPayload, ack: Ack) => void;
  "room:join": (payload: JoinPayload, ack: Ack) => void;
  "room:leave": () => void;
  "room:settings": (settings: Partial<Settings>) => void;
  "game:start": () => void;
  "game:again": () => void;
  "turn:choose": (index: number) => void;
  "chat:send": (text: string) => void;
  "draw:begin": (action: Extract<DrawAction, { kind: "stroke" }>) => void;
  "draw:points": (data: { id: string; points: number[] }) => void;
  "draw:fill": (action: Extract<DrawAction, { kind: "fill" }>) => void;
  "draw:clear": (action: Extract<DrawAction, { kind: "clear" }>) => void;
  "draw:undo": () => void;
  "turn:react": (kind: "like" | "dislike") => void;
}
