import { randomUUID } from "node:crypto";
import { DEFAULT_SETTINGS, LIMITS, SETTING_OPTIONS, TIMING } from "../../../shared/constants.js";
import type { ChatLine, Phase, PublicPlayer, RoomState, Settings, WordChoice } from "../../../shared/types.js";
import { CATEGORY_IDS } from "../../../shared/words.js";
import { checkGuess, cleanCustomWords, cleanText, difficultyBonus, drawerPoints, guessPoints, hintOrder, revealPattern } from "./rules.js";
import { pickChoices } from "./wordPool.js";

/** A player counts as away after this long without a request or heartbeat. */
export const AWAY_MS = 25_000;
/** A player is removed after this long without a request or heartbeat. */
export const REMOVE_MS = TIMING.reconnectGraceSeconds * 1000 + 60_000;

export interface PlayerData {
  id: string;
  name: string;
  color: string;
  score: number;
  guessed: boolean;
  gain: number;
  lastSeen: number;
}

/** Everything about a room, stored as one JSON document. Contains the secret word: never send it to clients. */
export interface RoomData {
  code: string;
  hostId: string;
  phase: Phase;
  settings: Settings;
  players: PlayerData[];
  round: number;
  drawOrder: string[];
  turnIndex: number;
  /** Increments every turn. Realtime channel names include it, so access is re-checked each turn. */
  turnId: number;
  drawerId: string | null;
  choices: WordChoice[];
  word: WordChoice | null;
  hintPositions: number[];
  phaseStartedAt: number | null;
  phaseEndsAt: number | null;
  phaseDuration: number;
  likes: string[];
  dislikes: string[];
  /** Keys of every word shown this game, oldest first. Cleared when a game starts. */
  usedWords: string[];
  endReason: RoomState["endReason"];
  solvedCount: number;
}

export type Effect =
  | { kind: "chat"; line: ChatLine; scope: "room" | "solved" }
  | { kind: "turnEnded"; turnId: number; word: WordChoice; drawerName: string; drawerColor: string }
  | { kind: "gameStarted" }
  | { kind: "gameOver" };

export type Result = { ok: true } | { ok: false; message: string };
const fail = (message: string): Result => ({ ok: false, message });
const OK: Result = { ok: true };

export function newRoom(code: string): RoomData {
  return {
    code,
    hostId: "",
    phase: "lobby",
    settings: { ...DEFAULT_SETTINGS, categories: [], customWords: [] },
    players: [],
    round: 0,
    drawOrder: [],
    turnIndex: 0,
    turnId: 0,
    drawerId: null,
    choices: [],
    word: null,
    hintPositions: [],
    phaseStartedAt: null,
    phaseEndsAt: null,
    phaseDuration: 0,
    likes: [],
    dislikes: [],
    usedWords: [],
    endReason: null,
    solvedCount: 0,
  };
}

/**
 * The game rules. Wraps a RoomData, mutates it in place, and records effects
 * (chat lines, finished turns) for the caller to deliver after saving.
 * There are no timers: `advance(now)` moves the game past any deadline that has passed.
 */
export class Game {
  readonly effects: Effect[] = [];
  /** Private chat lines for the player who made the request ("so close"). */
  readonly privateLines: ChatLine[] = [];

  constructor(
    readonly data: RoomData,
    private rng: () => number = Math.random,
  ) {}

  // ---------- helpers ----------

  private player(id: string | null | undefined): PlayerData | undefined {
    return id ? this.data.players.find((p) => p.id === id) : undefined;
  }

  isConnected(p: PlayerData, now: number): boolean {
    return now - p.lastSeen < AWAY_MS;
  }

  private connected(now: number): PlayerData[] {
    return this.data.players.filter((p) => this.isConnected(p, now));
  }

  private system(text: string) {
    this.effects.push({ kind: "chat", scope: "room", line: { id: randomUUID(), kind: "system", text } });
  }

  private setPhase(phase: Phase, start: number, seconds: number) {
    this.data.phase = phase;
    this.data.phaseStartedAt = start;
    this.data.phaseDuration = seconds;
    this.data.phaseEndsAt = start + seconds * 1000;
  }

  private inGame() {
    return this.data.phase !== "lobby" && this.data.phase !== "podium";
  }

  get isEmpty() {
    return this.data.players.length === 0;
  }

  hasPlayer(id: string) {
    return !!this.player(id);
  }

  // ---------- players ----------

  join(input: { id: string; name: string; color: string }, now: number): Result {
    const name = cleanText(input.name, LIMITS.nameMax);
    if (!name) return fail("Type a name to join.");
    const existing = this.player(input.id);
    if (existing) {
      const wasAway = !this.isConnected(existing, now);
      existing.name = name;
      existing.color = input.color;
      existing.lastSeen = now;
      if (wasAway) this.system(`${name} is back`);
    } else {
      if (this.data.players.length >= this.data.settings.maxPlayers) {
        return fail(`This room is full (${this.data.settings.maxPlayers} players). Ask the host to raise the limit.`);
      }
      this.data.players.push({ id: input.id, name, color: input.color, score: 0, guessed: false, gain: 0, lastSeen: now });
      this.system(`${name} joined`);
    }
    const host = this.player(this.data.hostId);
    if (!host || !this.isConnected(host, now)) this.data.hostId = input.id;
    return OK;
  }

  /** Any request from a player counts as a heartbeat. */
  touch(id: string, now: number) {
    const p = this.player(id);
    if (p) p.lastSeen = now;
  }

  leave(id: string, now: number) {
    const p = this.player(id);
    if (!p) return;
    this.remove(p, now);
  }

  private remove(p: PlayerData, now: number) {
    const wasDrawer = p.id === this.data.drawerId && (this.data.phase === "choosing" || this.data.phase === "drawing");
    this.data.players = this.data.players.filter((x) => x.id !== p.id);
    this.data.likes = this.data.likes.filter((x) => x !== p.id);
    this.data.dislikes = this.data.dislikes.filter((x) => x !== p.id);
    this.system(`${p.name} left`);
    if (this.data.hostId === p.id) this.migrateHost(now);
    if (wasDrawer) this.endTurn("drawer-left", now);
  }

  private migrateHost(now: number) {
    const next = this.connected(now)[0] ?? this.data.players[0];
    this.data.hostId = next?.id ?? "";
  }

  // ---------- lobby ----------

  updateSettings(id: string, patch: Partial<Settings>): Result {
    if (id !== this.data.hostId) return fail("Only the host can change settings.");
    if (this.data.phase !== "lobby") return fail("Settings can only change in the lobby.");
    const s = { ...this.data.settings };
    const has = <T extends number>(list: readonly T[], v: number | undefined): v is T => v !== undefined && (list as readonly number[]).includes(v);
    if (has(SETTING_OPTIONS.rounds, patch.rounds)) s.rounds = patch.rounds;
    if (has(SETTING_OPTIONS.drawTime, patch.drawTime)) s.drawTime = patch.drawTime;
    if (has(SETTING_OPTIONS.wordChoices, patch.wordChoices)) s.wordChoices = patch.wordChoices;
    if (patch.maxPlayers !== undefined) {
      const floor = Math.max(LIMITS.playersMin, this.data.players.length);
      s.maxPlayers = Math.max(floor, Math.min(LIMITS.playersMax, Math.round(patch.maxPlayers)));
    }
    if (patch.language === "en" || patch.language === "id") s.language = patch.language;
    if (patch.categories) s.categories = [...new Set(patch.categories.filter((c) => CATEGORY_IDS.includes(c)))];
    if (patch.customWords) s.customWords = cleanCustomWords(patch.customWords);
    if (patch.customOnly !== undefined) s.customOnly = !!patch.customOnly;
    if (patch.mode === "classic" || patch.mode === "speed") s.mode = patch.mode;
    this.data.settings = s;
    return OK;
  }

  start(id: string, now: number): Result {
    const d = this.data;
    if (id !== d.hostId) return fail("Only the host can start the game.");
    if (d.phase !== "lobby") return fail("The game has already started.");
    if (this.connected(now).length < LIMITS.playersMin) return fail("You need at least 2 players. Share the invite link.");
    if (d.settings.customOnly && d.settings.customWords.length < d.settings.wordChoices) {
      return fail(`Add at least ${d.settings.wordChoices} custom words, or turn off "custom words only".`);
    }
    for (const p of d.players) {
      p.score = 0;
      p.gain = 0;
      p.guessed = false;
    }
    d.round = 1;
    d.drawOrder = this.connected(now).map((p) => p.id);
    d.turnIndex = 0;
    d.usedWords = [];
    this.effects.push({ kind: "gameStarted" });
    this.system("Game on. Good luck");
    this.startTurn(now);
    return OK;
  }

  again(id: string): Result {
    if (id !== this.data.hostId) return fail("Only the host can start a new game.");
    if (this.data.phase !== "podium") return fail("The game is still running.");
    this.backToLobby();
    return OK;
  }

  private backToLobby(message?: string) {
    const d = this.data;
    d.phase = "lobby";
    d.round = 0;
    d.drawerId = null;
    d.word = null;
    d.choices = [];
    d.phaseStartedAt = null;
    d.phaseEndsAt = null;
    d.endReason = null;
    for (const p of d.players) {
      p.guessed = false;
      p.gain = 0;
    }
    if (message) this.system(message);
  }

  // ---------- turns ----------

  private startTurn(at: number) {
    const d = this.data;
    const live = (id: string) => {
      const p = this.player(id);
      return !!p && this.isConnected(p, at);
    };
    while (d.turnIndex < d.drawOrder.length && !live(d.drawOrder[d.turnIndex])) d.turnIndex++;
    if (d.turnIndex >= d.drawOrder.length) {
      d.round++;
      if (d.round > d.settings.rounds) {
        this.finishGame();
        return;
      }
      d.drawOrder = this.connected(at).map((p) => p.id);
      d.turnIndex = 0;
    }
    if (this.connected(at).length < LIMITS.playersMin || !d.drawOrder[d.turnIndex]) {
      this.backToLobby("Not enough players left, so the game stopped.");
      return;
    }
    d.turnId++;
    d.drawerId = d.drawOrder[d.turnIndex];
    for (const p of d.players) {
      p.guessed = false;
      p.gain = 0;
    }
    d.likes = [];
    d.dislikes = [];
    d.word = null;
    d.hintPositions = [];
    d.endReason = null;
    d.solvedCount = 0;
    // Every word shown to the drawer counts as seen, picked or not, so it won't come back this game.
    const picks = pickChoices(d.settings, d.settings.wordChoices, d.usedWords, this.rng);
    const shown = new Set(picks.map((w) => w.key));
    d.usedWords = [...d.usedWords.filter((k) => !shown.has(k)), ...shown];
    d.choices = picks.map(({ word, categoryId, difficulty }) => ({ word, categoryId, difficulty }));
    this.setPhase("choosing", at, TIMING.chooseSeconds);
  }

  choose(id: string, index: number, now: number): Result {
    const d = this.data;
    if (d.phase !== "choosing" || id !== d.drawerId) return fail("It's not your turn to choose.");
    const pick = d.choices[index];
    if (!pick) return fail("Pick one of the words shown.");
    d.word = pick;
    d.hintPositions = hintOrder(pick.word, this.rng);
    this.setPhase("drawing", now, d.settings.mode === "speed" ? TIMING.speedSeconds : d.settings.drawTime);
    return OK;
  }

  /** When each hint letter is revealed, as epoch ms. */
  hintTimes(): number[] {
    const d = this.data;
    if (d.phase !== "drawing" || d.phaseStartedAt === null) return [];
    // Classic reveals letters at 50% and 75% of the turn; a Speed round at 33% and 66%.
    const at = d.settings.mode === "speed" ? [1 / 3, 2 / 3] : [0.5, 0.75];
    return d.hintPositions.map((_, i) => d.phaseStartedAt! + d.phaseDuration * 1000 * at[i]);
  }

  private endTurn(reason: NonNullable<RoomState["endReason"]>, at: number) {
    const d = this.data;
    const drawer = this.player(d.drawerId);
    if (drawer && d.word && reason !== "drawer-left") {
      const eligible = d.players.filter((p) => p.id !== drawer.id && (p.guessed || this.isConnected(p, at))).length;
      const gain = Math.round(drawerPoints(d.solvedCount, eligible) * difficultyBonus(d.word.difficulty));
      drawer.score += gain;
      drawer.gain = gain;
    }
    if (d.word && drawer) {
      this.effects.push({ kind: "turnEnded", turnId: d.turnId, word: d.word, drawerName: drawer.name, drawerColor: drawer.color });
    }
    d.endReason = reason;
    this.setPhase("reveal", at, TIMING.revealSeconds);
    if (reason === "drawer-left") this.system("The drawer left, so this turn is skipped");
  }

  private finishGame() {
    const d = this.data;
    d.phase = "podium";
    d.drawerId = null;
    d.word = null;
    d.phaseStartedAt = null;
    d.phaseEndsAt = null;
    d.round = d.settings.rounds;
    this.effects.push({ kind: "gameOver" });
  }

  private allGuessed(now: number): boolean {
    const guessers = this.connected(now).filter((p) => p.id !== this.data.drawerId);
    return guessers.length > 0 && guessers.every((p) => p.guessed);
  }

  /** Move past every deadline that has passed. Safe to call on every request. */
  advance(now: number) {
    const d = this.data;
    for (let guard = 0; guard < 12; guard++) {
      const stale = d.players.find((p) => now - p.lastSeen > REMOVE_MS);
      if (stale) {
        this.remove(stale, now);
        continue;
      }
      if (d.players.length === 0) return;
      const host = this.player(d.hostId);
      if (!host || !this.isConnected(host, now)) {
        const next = this.connected(now)[0];
        if (next && next.id !== d.hostId) d.hostId = next.id;
      }
      if (this.inGame() && this.connected(now).length < LIMITS.playersMin) {
        this.backToLobby("Not enough players left, so the game stopped. Invite someone and start again.");
        continue;
      }
      const drawer = this.player(d.drawerId);
      const drawerAway = !drawer || !this.isConnected(drawer, now);
      const deadline = d.phaseEndsAt ?? Infinity;
      if (d.phase === "choosing") {
        if (drawerAway) {
          this.endTurn("drawer-left", Math.min(now, deadline));
          continue;
        }
        if (now >= deadline) {
          this.choose(drawer!.id, 0, deadline);
          continue;
        }
      }
      if (d.phase === "drawing") {
        if (now >= deadline) {
          this.endTurn("time-up", deadline);
          continue;
        }
        if (drawerAway) {
          this.endTurn("drawer-left", now);
          continue;
        }
        if (this.allGuessed(now)) {
          this.endTurn("all-guessed", now);
          continue;
        }
      }
      if (d.phase === "reveal" && now >= deadline) {
        d.turnIndex++;
        this.startTurn(deadline);
        continue;
      }
      return;
    }
  }

  // ---------- chat & guessing ----------

  chat(id: string, raw: string, now: number) {
    const d = this.data;
    const p = this.player(id);
    if (!p) return;
    const text = cleanText(raw, LIMITS.chatMax);
    if (!text) return;
    const line: ChatLine = { id: randomUUID(), kind: "chat", playerId: p.id, name: p.name, color: p.color, text };

    if (d.phase === "drawing" && d.word) {
      if (p.id === d.drawerId || p.guessed) {
        this.effects.push({ kind: "chat", scope: "solved", line: { ...line, solvedOnly: true } });
        return;
      }
      const result = checkGuess(text, d.word.word);
      if (result === "correct") {
        this.correctGuess(p, now);
        return;
      }
      if (result === "close") {
        this.privateLines.push(line, { id: randomUUID(), kind: "close", text: `"${text}" is very close` });
        return;
      }
    }
    this.effects.push({ kind: "chat", scope: "room", line });
  }

  private correctGuess(p: PlayerData, now: number) {
    const d = this.data;
    const secondsLeft = d.phaseEndsAt ? (d.phaseEndsAt - now) / 1000 : 0;
    const gain = Math.round(guessPoints(secondsLeft, d.phaseDuration, d.solvedCount) * difficultyBonus(d.word?.difficulty));
    d.solvedCount++;
    p.guessed = true;
    p.gain = gain;
    p.score += gain;
    this.effects.push({
      kind: "chat",
      scope: "room",
      line: { id: randomUUID(), kind: "correct", playerId: p.id, name: p.name, color: p.color, text: `${p.name} guessed the word` },
    });
  }

  react(id: string, kind: "like" | "dislike") {
    const d = this.data;
    if (d.phase !== "drawing" && d.phase !== "reveal") return;
    if (id === d.drawerId || !this.player(id)) return;
    d.likes = d.likes.filter((x) => x !== id);
    d.dislikes = d.dislikes.filter((x) => x !== id);
    (kind === "like" ? d.likes : d.dislikes).push(id);
  }

  // ---------- views ----------

  /** What one player may know beyond the public state. */
  privateFor(id: string): { choices?: WordChoice[]; word?: WordChoice } {
    const d = this.data;
    if (d.phase === "choosing" && id === d.drawerId) return { choices: d.choices };
    if (d.phase === "drawing" && d.word && (id === d.drawerId || this.player(id)?.guessed)) return { word: d.word };
    return {};
  }

  state(now: number, rev: number): RoomState {
    const d = this.data;
    const players: PublicPlayer[] = d.players.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      score: p.score,
      connected: this.isConnected(p, now),
      guessed: p.guessed,
      gain: p.gain,
    }));
    const times = this.hintTimes();
    const shown = times.filter((t) => t <= now).length;
    const showHint = (d.phase === "drawing" || d.phase === "reveal") && d.word;
    return {
      code: d.code,
      rev,
      turnId: d.turnId,
      phase: d.phase,
      // Rooms saved before Speed rounds existed have no mode.
      settings: { ...d.settings, mode: d.settings.mode ?? "classic" },
      players,
      hostId: d.hostId,
      round: d.round,
      drawerId: d.drawerId,
      phaseEndsAt: d.phaseEndsAt,
      phaseDuration: d.phaseDuration,
      hintTimes: times,
      serverNow: now,
      hint: showHint ? { categoryId: d.word!.categoryId, pattern: revealPattern(d.word!.word, d.hintPositions.slice(0, shown)) } : null,
      revealWord: d.phase === "reveal" ? (d.word?.word ?? null) : null,
      revealDifficulty: d.phase === "reveal" && d.word ? (d.word.difficulty ?? null) : null,
      reactions: { likes: d.likes.length, dislikes: d.dislikes.length },
      endReason: d.phase === "reveal" ? d.endReason : null,
    };
  }
}
