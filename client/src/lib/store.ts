import { useSyncExternalStore } from "react";
import type { ChatLine, DrawAction, GalleryItem, RoomState, WordChoice } from "../../../shared/types";
import { loadProfile, sessionId } from "./profile";
import { socket } from "./socket";
import { play } from "./sound";

export interface GameStore {
  connected: boolean;
  you: string | null;
  room: RoomState | null;
  /** Server clock minus local clock, in ms. */
  clockOffset: number;
  chat: ChatLine[];
  choices: WordChoice[] | null;
  myWord: WordChoice | null;
  gallery: GalleryItem[];
  toasts: { id: number; message: string }[];
  /** Increments every time you personally guess right, to trigger celebrations. */
  myCorrectAt: number;
}

let state: GameStore = {
  connected: false,
  you: null,
  room: null,
  clockOffset: 0,
  chat: [],
  choices: null,
  myWord: null,
  gallery: [],
  toasts: [],
  myCorrectAt: 0,
};

const listeners = new Set<() => void>();

function set(patch: Partial<GameStore>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function getState() {
  return state;
}

export function useGame<T>(selector: (s: GameStore) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => selector(state),
  );
}

let toastId = 0;
export function toast(message: string) {
  const id = ++toastId;
  set({ toasts: [...state.toasts.slice(-2), { id, message }] });
  setTimeout(() => set({ toasts: state.toasts.filter((t) => t.id !== id) }), 4200);
}

// ---------- drawing log, shared by the board and the socket ----------

type DrawEvent =
  | { type: "reset" }
  | { type: "action"; action: DrawAction }
  | { type: "points"; id: string; from: number };

export const drawing = {
  actions: [] as DrawAction[],
  listeners: new Set<(e: DrawEvent) => void>(),
  emit(e: DrawEvent) {
    this.listeners.forEach((l) => l(e));
  },
  subscribe(fn: (e: DrawEvent) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  },
  reset(actions: DrawAction[]) {
    this.actions = actions;
    this.emit({ type: "reset" });
  },
  push(action: DrawAction) {
    this.actions.push(action);
    this.emit({ type: "action", action });
  },
  append(id: string, points: number[]) {
    for (let i = this.actions.length - 1; i >= Math.max(0, this.actions.length - 4); i--) {
      const a = this.actions[i];
      if (a.kind === "stroke" && a.id === id) {
        const from = a.points.length / 2;
        a.points.push(...points);
        this.emit({ type: "points", id, from });
        return;
      }
    }
  },
  undo() {
    this.actions.pop();
    this.emit({ type: "reset" });
  },
};

// ---------- room actions ----------

let currentCode: string | null = null;

function ensureConnected() {
  if (!socket.connected) socket.connect();
}

export function createRoom(name: string, color: string): Promise<string> {
  ensureConnected();
  return new Promise((resolve, reject) => {
    socket.timeout(8000).emit("room:create", { name, color, sessionId: sessionId() }, (err, res) => {
      if (err) return reject(new Error("The server didn't answer. Check your connection and try again."));
      if (!res.ok) return reject(new Error(res.message));
      currentCode = res.code;
      resolve(res.code);
    });
  });
}

export function joinRoom(code: string, name: string, color: string): Promise<string> {
  ensureConnected();
  return new Promise((resolve, reject) => {
    socket.timeout(8000).emit("room:join", { code, name, color, sessionId: sessionId() }, (err, res) => {
      if (err) return reject(new Error("The server didn't answer. Check your connection and try again."));
      if (!res.ok) return reject(new Error(res.message));
      currentCode = res.code;
      resolve(res.code);
    });
  });
}

export function leaveRoom() {
  socket.emit("room:leave");
  currentCode = null;
  drawing.reset([]);
  set({ room: null, you: null, chat: [], choices: null, myWord: null, gallery: [] });
}

// ---------- socket wiring ----------

socket.on("connect", () => {
  set({ connected: true });
  // Rejoin after a dropped connection.
  if (currentCode) {
    const p = loadProfile();
    socket.emit("room:join", { code: currentCode, name: p.name, color: p.color, sessionId: sessionId() }, (res) => {
      if (!res.ok) {
        toast(res.message);
        currentCode = null;
        set({ room: null });
      }
    });
  }
});

socket.on("disconnect", () => set({ connected: false }));

socket.on("room:you", ({ playerId }) => set({ you: playerId }));

socket.on("room:state", (room) => {
  const prev = state.room;
  const patch: Partial<GameStore> = { room, clockOffset: room.serverNow - Date.now() };
  if (room.phase !== "choosing") patch.choices = null;
  if (room.phase === "choosing" || room.phase === "lobby") patch.myWord = null;
  if (room.phase === "lobby" && prev?.phase !== "lobby") patch.gallery = [];
  if (prev && prev.phase !== room.phase) {
    if (room.phase === "choosing") play("turn");
    if (room.phase === "reveal") play("reveal");
    if (room.phase === "podium") play("win");
  }
  set(patch);
});

socket.on("room:error", ({ message }) => toast(message));
socket.on("turn:choices", (choices) => set({ choices }));
socket.on("turn:word", (w) => set({ myWord: w }));
socket.on("game:gallery", (gallery) => set({ gallery }));

socket.on("chat:line", (line) => {
  set({ chat: [...state.chat.slice(-150), line] });
  if (line.kind === "correct") {
    if (line.playerId === state.you) {
      play("correct");
      set({ myCorrectAt: Date.now() });
    } else play("otherCorrect");
  } else if (line.kind === "close") play("close");
  else if (line.kind === "system" && line.text.endsWith(" joined")) play("join");
});

socket.on("draw:sync", (actions) => drawing.reset(actions.map((a) => (a.kind === "stroke" ? { ...a, points: [...a.points] } : a))));
socket.on("draw:begin", (a) => drawing.push({ ...a, points: [...a.points] }));
socket.on("draw:points", ({ id, points }) => drawing.append(id, points));
socket.on("draw:fill", (a) => drawing.push(a));
socket.on("draw:clear", (a) => drawing.push(a));
socket.on("draw:undo", () => drawing.undo());
