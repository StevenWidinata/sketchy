import { useSyncExternalStore } from "react";
import type { ChatLine, DrawAction, GalleryItem, RoomState, WordChoice } from "../../../shared/types";

export interface GameStore {
  /** Realtime connection to the room is live. */
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
  /** Set every time you personally guess right, to trigger celebrations. */
  myCorrectAt: number;
}

let state: GameStore = {
  connected: true,
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

export function setState(patch: Partial<GameStore>) {
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
  setState({ toasts: [...state.toasts.slice(-2), { id, message }] });
  setTimeout(() => setState({ toasts: state.toasts.filter((t) => t.id !== id) }), 4200);
}

// ---------- drawing log, shared by the board, the realtime channel and the sync uploader ----------

type DrawLogEvent =
  | { type: "reset" }
  | { type: "action"; action: DrawAction }
  | { type: "points"; id: string; from: number };

export const drawing = {
  actions: [] as DrawAction[],
  /** Index of the first action the server copy may be missing (drawer only). */
  dirtyFrom: Infinity,
  listeners: new Set<(e: DrawLogEvent) => void>(),
  emit(e: DrawLogEvent) {
    this.listeners.forEach((l) => l(e));
  },
  subscribe(fn: (e: DrawLogEvent) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  },
  markDirty(index: number) {
    this.dirtyFrom = Math.min(this.dirtyFrom, Math.max(0, index));
  },
  reset(actions: DrawAction[]) {
    this.actions = actions;
    this.dirtyFrom = Infinity;
    this.emit({ type: "reset" });
  },
  /** Merge a server snapshot with any live actions that arrived before it. */
  merge(snapshot: DrawAction[]) {
    const known = new Set(snapshot.map((a) => a.id));
    const live = this.actions.filter((a) => !known.has(a.id));
    this.reset([...snapshot, ...live]);
  },
  push(action: DrawAction) {
    const existing = this.actions.findIndex((a) => a.id === action.id);
    if (existing >= 0) return;
    this.actions.push(action);
    this.markDirty(this.actions.length - 1);
    this.emit({ type: "action", action });
  },
  append(id: string, points: number[]) {
    for (let i = this.actions.length - 1; i >= Math.max(0, this.actions.length - 6); i--) {
      const a = this.actions[i];
      if (a.kind === "stroke" && a.id === id) {
        const from = a.points.length / 2;
        a.points.push(...points);
        this.markDirty(i);
        this.emit({ type: "points", id, from });
        return;
      }
    }
  },
  undo() {
    this.actions.pop();
    this.markDirty(this.actions.length);
    this.emit({ type: "reset" });
  },
};
