import { randomUUID } from "node:crypto";
import { DEFAULT_SETTINGS, LIMITS, SETTING_OPTIONS, TIMING } from "../../../shared/constants";
import { CATEGORY_IDS } from "../../../shared/words";
import type {
  ChatLine,
  DrawAction,
  GalleryItem,
  Phase,
  PublicPlayer,
  RoomState,
  ServerToClient,
  Settings,
  WordChoice,
} from "../../../shared/types";
import {
  checkGuess,
  cleanCustomWords,
  cleanText,
  drawerPoints,
  guessPoints,
  hintOrder,
  revealPattern,
} from "./rules";
import { pickChoices } from "./wordPool";

type Events = ServerToClient;
type Args<E extends keyof Events> = Parameters<Events[E]>;

export interface Transport {
  toRoom<E extends keyof Events>(event: E, ...args: Args<E>): void;
  toSocket<E extends keyof Events>(socketId: string, event: E, ...args: Args<E>): void;
  toRoomExcept<E extends keyof Events>(socketId: string, event: E, ...args: Args<E>): void;
}

interface Player {
  id: string;
  sessionId: string;
  socketId: string | null;
  name: string;
  color: string;
  score: number;
  guessed: boolean;
  gain: number;
  connected: boolean;
  leaveTimer: ReturnType<typeof setTimeout> | null;
}

export type Result = { ok: true } | { ok: false; message: string };
const fail = (message: string): Result => ({ ok: false, message });
const OK: Result = { ok: true };

export class Room {
  readonly code: string;
  private players = new Map<string, Player>();
  private hostId = "";
  private phase: Phase = "lobby";
  private settings: Settings = { ...DEFAULT_SETTINGS, categories: [], customWords: [] };
  private round = 0;
  private drawOrder: string[] = [];
  private turnIndex = 0;
  private drawerId: string | null = null;
  private choices: WordChoice[] = [];
  private word: WordChoice | null = null;
  private hintPositions: number[] = [];
  private hintsShown = 0;
  private phaseEndsAt: number | null = null;
  private phaseDuration = 0;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private actions: DrawAction[] = [];
  private pointCount = 0;
  private likes = new Set<string>();
  private dislikes = new Set<string>();
  private gallery: GalleryItem[] = [];
  private usedWords = new Set<string>();
  private endReason: RoomState["endReason"] = null;
  private solvedCount = 0;

  constructor(
    code: string,
    private io: Transport,
    private onEmpty: (code: string) => void,
    private rng: () => number = Math.random,
  ) {
    this.code = code;
  }

  // ---------- players ----------

  join(input: { sessionId: string; socketId: string; name: string; color: string }): Result & { playerId?: string } {
    const name = cleanText(input.name, LIMITS.nameMax);
    if (!name) return fail("Type a name to join.");

    let player = [...this.players.values()].find((p) => p.sessionId === input.sessionId);
    if (player) {
      if (player.leaveTimer) clearTimeout(player.leaveTimer);
      player.leaveTimer = null;
      player.socketId = input.socketId;
      player.connected = true;
      player.name = name;
      player.color = input.color;
    } else {
      if (this.players.size >= this.settings.maxPlayers) {
        return fail(`This room is full (${this.settings.maxPlayers} players). Ask the host to raise the limit.`);
      }
      player = {
        id: randomUUID(),
        sessionId: input.sessionId,
        socketId: input.socketId,
        name,
        color: input.color,
        score: 0,
        guessed: false,
        gain: 0,
        connected: true,
        leaveTimer: null,
      };
      this.players.set(player.id, player);
      this.system(`${name} joined`);
    }
    if (!this.hostId || !this.players.get(this.hostId)?.connected) this.hostId = player.id;

    const socketId = input.socketId;
    this.io.toSocket(socketId, "room:you", { playerId: player.id });
    this.broadcast();
    // Catch the player up on what they missed.
    if (this.phase === "drawing" || this.phase === "reveal") this.io.toSocket(socketId, "draw:sync", this.actions);
    if (this.phase === "choosing" && player.id === this.drawerId) this.io.toSocket(socketId, "turn:choices", this.choices);
    if (this.phase === "drawing" && this.word && (player.id === this.drawerId || player.guessed)) {
      this.io.toSocket(socketId, "turn:word", { ...this.word });
    }
    if (this.phase === "podium") this.io.toSocket(socketId, "game:gallery", this.gallery);
    return { ok: true, playerId: player.id };
  }

  /** Socket dropped: keep the seat for a grace period so a refresh or flaky network doesn't cost the score. */
  disconnect(playerId: string): void {
    const p = this.players.get(playerId);
    if (!p) return;
    p.connected = false;
    p.socketId = null;
    if (p.leaveTimer) clearTimeout(p.leaveTimer);
    p.leaveTimer = setTimeout(() => this.remove(playerId), TIMING.reconnectGraceSeconds * 1000);
    this.afterDeparture(p);
  }

  /** Player chose to leave. */
  leave(playerId: string): void {
    const p = this.players.get(playerId);
    if (!p) return;
    p.connected = false;
    p.socketId = null;
    this.afterDeparture(p);
    this.remove(playerId);
  }

  private remove(playerId: string): void {
    const p = this.players.get(playerId);
    if (!p) return;
    if (p.leaveTimer) clearTimeout(p.leaveTimer);
    this.players.delete(playerId);
    this.system(`${p.name} left`);
    if (this.hostId === playerId) this.migrateHost();
    if (this.players.size === 0) {
      this.clearTimers();
      this.onEmpty(this.code);
      return;
    }
    this.broadcast();
  }

  private afterDeparture(p: Player): void {
    if (this.hostId === p.id) this.migrateHost();
    const inGame = this.phase !== "lobby" && this.phase !== "podium";
    if (inGame && this.connectedPlayers().length < LIMITS.playersMin) {
      this.backToLobby("Not enough players left, so the game stopped. Invite someone and start again.");
      return;
    }
    if (p.id === this.drawerId && (this.phase === "choosing" || this.phase === "drawing")) {
      this.endTurn("drawer-left");
      return;
    }
    if (this.phase === "drawing") this.checkAllGuessed();
    this.broadcast();
  }

  private migrateHost(): void {
    const next = this.connectedPlayers()[0] ?? [...this.players.values()][0];
    this.hostId = next?.id ?? "";
  }

  private connectedPlayers(): Player[] {
    return [...this.players.values()].filter((p) => p.connected);
  }

  get size(): number {
    return this.players.size;
  }

  get connectedCount(): number {
    return this.connectedPlayers().length;
  }

  // ---------- lobby ----------

  updateSettings(playerId: string, patch: Partial<Settings>): Result {
    if (playerId !== this.hostId) return fail("Only the host can change settings.");
    if (this.phase !== "lobby") return fail("Settings can only change in the lobby.");
    const s = { ...this.settings };
    if (patch.rounds !== undefined && (SETTING_OPTIONS.rounds as readonly number[]).includes(patch.rounds)) s.rounds = patch.rounds;
    if (patch.drawTime !== undefined && (SETTING_OPTIONS.drawTime as readonly number[]).includes(patch.drawTime)) s.drawTime = patch.drawTime;
    if (patch.wordChoices !== undefined && (SETTING_OPTIONS.wordChoices as readonly number[]).includes(patch.wordChoices)) s.wordChoices = patch.wordChoices;
    if (patch.maxPlayers !== undefined) {
      s.maxPlayers = Math.max(Math.max(LIMITS.playersMin, this.players.size), Math.min(LIMITS.playersMax, Math.round(patch.maxPlayers)));
    }
    if (patch.language === "en" || patch.language === "id") s.language = patch.language;
    if (patch.categories) s.categories = [...new Set(patch.categories.filter((id) => CATEGORY_IDS.includes(id)))];
    if (patch.customWords) s.customWords = cleanCustomWords(patch.customWords);
    if (patch.customOnly !== undefined) s.customOnly = !!patch.customOnly;
    this.settings = s;
    this.broadcast();
    return OK;
  }

  start(playerId: string): Result {
    if (playerId !== this.hostId) return fail("Only the host can start the game.");
    if (this.phase !== "lobby") return fail("The game has already started.");
    if (this.connectedPlayers().length < LIMITS.playersMin) return fail("You need at least 2 players. Share the invite link.");
    if (this.settings.customOnly && this.settings.customWords.length < this.settings.wordChoices) {
      return fail(`Add at least ${this.settings.wordChoices} custom words, or turn off "custom words only".`);
    }
    for (const p of this.players.values()) {
      p.score = 0;
      p.gain = 0;
      p.guessed = false;
    }
    this.round = 1;
    this.drawOrder = this.connectedPlayers().map((p) => p.id);
    this.turnIndex = 0;
    this.gallery = [];
    this.usedWords.clear();
    this.system("Game on. Good luck");
    this.startTurn();
    return OK;
  }

  again(playerId: string): Result {
    if (playerId !== this.hostId) return fail("Only the host can start a new game.");
    if (this.phase !== "podium") return fail("The game is still running.");
    this.backToLobby();
    return OK;
  }

  private backToLobby(message?: string): void {
    this.clearTimers();
    this.phase = "lobby";
    this.round = 0;
    this.drawerId = null;
    this.word = null;
    this.choices = [];
    this.actions = [];
    this.phaseEndsAt = null;
    this.endReason = null;
    for (const p of this.players.values()) {
      p.guessed = false;
      p.gain = 0;
    }
    if (message) this.system(message);
    this.broadcast();
  }

  // ---------- turns ----------

  private startTurn(): void {
    this.clearTimers();
    while (this.turnIndex < this.drawOrder.length && !this.players.get(this.drawOrder[this.turnIndex])?.connected) {
      this.turnIndex++;
    }
    if (this.turnIndex >= this.drawOrder.length) {
      this.round++;
      if (this.round > this.settings.rounds) {
        this.finishGame();
        return;
      }
      this.drawOrder = this.connectedPlayers().map((p) => p.id);
      this.turnIndex = 0;
    }
    if (this.connectedPlayers().length < LIMITS.playersMin) {
      this.backToLobby("Not enough players left, so the game stopped.");
      return;
    }
    const drawer = this.players.get(this.drawOrder[this.turnIndex])!;
    this.drawerId = drawer.id;
    for (const p of this.players.values()) {
      p.guessed = false;
      p.gain = 0;
    }
    this.actions = [];
    this.pointCount = 0;
    this.likes.clear();
    this.dislikes.clear();
    this.word = null;
    this.hintPositions = [];
    this.hintsShown = 0;
    this.endReason = null;
    this.solvedCount = 0;
    this.choices = pickChoices(this.settings, this.settings.wordChoices, this.usedWords, this.rng);
    this.setPhase("choosing", TIMING.chooseSeconds);
    this.later(TIMING.chooseSeconds * 1000, () => this.choose(drawer.id, 0));
    if (drawer.socketId) this.io.toSocket(drawer.socketId, "turn:choices", this.choices);
    this.io.toRoom("draw:sync", []);
    this.broadcast();
  }

  choose(playerId: string, index: number): Result {
    if (this.phase !== "choosing" || playerId !== this.drawerId) return fail("It's not your turn to choose.");
    const pick = this.choices[index];
    if (!pick) return fail("Pick one of the words shown.");
    this.clearTimers();
    this.word = pick;
    this.usedWords.add(pick.word);
    this.hintPositions = hintOrder(pick.word, this.rng);
    const duration = this.settings.drawTime;
    this.setPhase("drawing", duration);
    this.hintPositions.forEach((_, i) => {
      this.later(duration * 1000 * (0.5 + 0.25 * i), () => {
        this.hintsShown = i + 1;
        this.broadcast();
      });
    });
    this.later(duration * 1000, () => this.endTurn("time-up"));
    const drawer = this.players.get(playerId)!;
    if (drawer.socketId) this.io.toSocket(drawer.socketId, "turn:word", { ...pick });
    this.broadcast();
    return OK;
  }

  private endTurn(reason: NonNullable<RoomState["endReason"]>): void {
    this.clearTimers();
    const drawer = this.drawerId ? this.players.get(this.drawerId) : undefined;
    if (drawer && this.word && reason !== "drawer-left") {
      const eligible = [...this.players.values()].filter((p) => p.id !== drawer.id && (p.connected || p.guessed)).length;
      const gain = drawerPoints(this.solvedCount, eligible);
      drawer.score += gain;
      drawer.gain = gain;
    }
    if (this.word && this.actions.length) {
      this.gallery.push({
        id: randomUUID(),
        drawerName: drawer?.name ?? "Someone",
        drawerColor: drawer?.color ?? "#ffffff",
        word: this.word.word,
        categoryId: this.word.categoryId,
        actions: this.actions,
      });
      const size = (g: GalleryItem) => g.actions.reduce((n, a) => n + (a.kind === "stroke" ? a.points.length : 2), 0);
      let total = this.gallery.reduce((n, g) => n + size(g), 0);
      while (this.gallery.length > LIMITS.galleryMax || (total > LIMITS.galleryPoints && this.gallery.length > 1)) {
        total -= size(this.gallery.shift()!);
      }
    }
    this.endReason = reason;
    this.setPhase("reveal", TIMING.revealSeconds);
    this.later(TIMING.revealSeconds * 1000, () => {
      this.turnIndex++;
      this.startTurn();
    });
    if (reason === "drawer-left") this.system(`${drawer?.name ?? "The drawer"} left, so this turn is skipped`);
    this.broadcast();
  }

  private finishGame(): void {
    this.clearTimers();
    this.phase = "podium";
    this.drawerId = null;
    this.word = null;
    this.phaseEndsAt = null;
    this.round = this.settings.rounds;
    this.io.toRoom("game:gallery", this.gallery);
    this.broadcast();
  }

  private checkAllGuessed(): void {
    if (this.phase !== "drawing") return;
    const guessers = this.connectedPlayers().filter((p) => p.id !== this.drawerId);
    if (guessers.length > 0 && guessers.every((p) => p.guessed)) this.endTurn("all-guessed");
  }

  // ---------- chat & guessing ----------

  chat(playerId: string, raw: string): void {
    const p = this.players.get(playerId);
    if (!p) return;
    const text = cleanText(raw, LIMITS.chatMax);
    if (!text) return;
    const line: ChatLine = { id: randomUUID(), kind: "chat", playerId: p.id, name: p.name, color: p.color, text };

    if (this.phase === "drawing" && this.word) {
      if (p.id === this.drawerId || p.guessed) {
        this.toSolved({ ...line, solvedOnly: true });
        return;
      }
      const result = checkGuess(text, this.word.word);
      if (result === "correct") {
        this.correctGuess(p);
        return;
      }
      if (result === "close" && p.socketId) {
        this.io.toSocket(p.socketId, "chat:line", line);
        this.io.toSocket(p.socketId, "chat:line", { id: randomUUID(), kind: "close", text: `"${text}" is very close` });
        return;
      }
    }
    this.io.toRoom("chat:line", line);
  }

  private correctGuess(p: Player): void {
    const secondsLeft = this.phaseEndsAt ? (this.phaseEndsAt - Date.now()) / 1000 : 0;
    const gain = guessPoints(secondsLeft, this.phaseDuration, this.solvedCount);
    this.solvedCount++;
    p.guessed = true;
    p.gain = gain;
    p.score += gain;
    this.io.toRoom("chat:line", { id: randomUUID(), kind: "correct", playerId: p.id, name: p.name, color: p.color, text: `${p.name} guessed the word` });
    if (p.socketId && this.word) this.io.toSocket(p.socketId, "turn:word", { ...this.word });
    this.broadcast();
    this.checkAllGuessed();
  }

  private toSolved(line: ChatLine): void {
    for (const p of this.players.values()) {
      if (p.socketId && (p.guessed || p.id === this.drawerId)) this.io.toSocket(p.socketId, "chat:line", line);
    }
  }

  private system(text: string): void {
    this.io.toRoom("chat:line", { id: randomUUID(), kind: "system", text });
  }

  react(playerId: string, kind: "like" | "dislike"): void {
    if (this.phase !== "drawing" && this.phase !== "reveal") return;
    if (playerId === this.drawerId || !this.players.has(playerId)) return;
    const [add, remove] = kind === "like" ? [this.likes, this.dislikes] : [this.dislikes, this.likes];
    remove.delete(playerId);
    add.add(playerId);
    this.broadcast();
  }

  // ---------- drawing ----------

  private canDraw(playerId: string): boolean {
    return this.phase === "drawing" && playerId === this.drawerId && this.actions.length < LIMITS.actionsPerTurn;
  }

  private relay<E extends "draw:begin" | "draw:points" | "draw:fill" | "draw:clear" | "draw:undo">(playerId: string, event: E, ...args: Args<E>) {
    const socketId = this.players.get(playerId)?.socketId;
    if (socketId) this.io.toRoomExcept(socketId, event, ...args);
  }

  drawBegin(playerId: string, action: Extract<DrawAction, { kind: "stroke" }>): void {
    if (!this.canDraw(playerId) || this.pointCount + action.points.length > LIMITS.pointsPerTurn) return;
    const stroke = { ...action, points: [...action.points] };
    this.actions.push(stroke);
    this.pointCount += stroke.points.length;
    this.relay(playerId, "draw:begin", stroke);
  }

  drawPoints(playerId: string, data: { id: string; points: number[] }): void {
    if (this.phase !== "drawing" || playerId !== this.drawerId) return;
    if (this.pointCount + data.points.length > LIMITS.pointsPerTurn) return;
    // The stroke being extended is almost always the last action.
    for (let i = this.actions.length - 1; i >= Math.max(0, this.actions.length - 4); i--) {
      const a = this.actions[i];
      if (a.kind === "stroke" && a.id === data.id) {
        a.points.push(...data.points);
        this.pointCount += data.points.length;
        this.relay(playerId, "draw:points", data);
        return;
      }
    }
  }

  drawFill(playerId: string, action: Extract<DrawAction, { kind: "fill" }>): void {
    if (!this.canDraw(playerId)) return;
    this.actions.push({ ...action });
    this.relay(playerId, "draw:fill", action);
  }

  drawClear(playerId: string, action: Extract<DrawAction, { kind: "clear" }>): void {
    if (!this.canDraw(playerId)) return;
    this.actions.push({ ...action });
    this.relay(playerId, "draw:clear", action);
  }

  drawUndo(playerId: string): void {
    if (this.phase !== "drawing" || playerId !== this.drawerId) return;
    const last = this.actions.pop();
    if (!last) return;
    if (last.kind === "stroke") this.pointCount -= last.points.length;
    this.relay(playerId, "draw:undo");
  }

  // ---------- state ----------

  private setPhase(phase: Phase, seconds: number): void {
    this.phase = phase;
    this.phaseDuration = seconds;
    this.phaseEndsAt = Date.now() + seconds * 1000;
  }

  private later(ms: number, fn: () => void): void {
    // Timer callbacks run outside any socket handler; never let one error take the server down.
    this.timers.push(
      setTimeout(() => {
        try {
          fn();
        } catch (err) {
          console.error(`[room ${this.code}] timer error`, err);
        }
      }, ms),
    );
  }

  private clearTimers(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
  }

  dispose(): void {
    this.clearTimers();
    for (const p of this.players.values()) if (p.leaveTimer) clearTimeout(p.leaveTimer);
  }

  state(): RoomState {
    const players: PublicPlayer[] = [...this.players.values()].map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      score: p.score,
      connected: p.connected,
      guessed: p.guessed,
      gain: p.gain,
    }));
    const showHint = (this.phase === "drawing" || this.phase === "reveal") && this.word;
    return {
      code: this.code,
      phase: this.phase,
      settings: this.settings,
      players,
      hostId: this.hostId,
      round: this.round,
      drawerId: this.drawerId,
      phaseEndsAt: this.phaseEndsAt,
      phaseDuration: this.phaseDuration,
      serverNow: Date.now(),
      hint: showHint
        ? { categoryId: this.word!.categoryId, pattern: revealPattern(this.word!.word, this.hintPositions.slice(0, this.hintsShown)) }
        : null,
      revealWord: this.phase === "reveal" ? (this.word?.word ?? null) : null,
      reactions: { likes: this.likes.size, dislikes: this.dislikes.size },
      endReason: this.phase === "reveal" ? this.endReason : null,
    };
  }

  private broadcast(): void {
    this.io.toRoom("room:state", this.state());
  }

  /** Test helper: the current secret word. */
  get currentWord(): string | null {
    return this.word?.word ?? null;
  }

  get currentPhase(): Phase {
    return this.phase;
  }
}
