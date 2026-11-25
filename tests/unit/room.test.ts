import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { Room, type Transport } from "../../server/src/game/Room";
import type { ChatLine, RoomState } from "../../shared/types";

interface Sent {
  to: string;
  event: string;
  args: unknown[];
}

function setup() {
  const sent: Sent[] = [];
  const io: Transport = {
    toRoom: (event, ...args) => void sent.push({ to: "room", event, args }),
    toSocket: (socketId, event, ...args) => void sent.push({ to: socketId, event, args }),
    toRoomExcept: (socketId, event, ...args) => void sent.push({ to: `!${socketId}`, event, args }),
  };
  const onEmpty = vi.fn();
  const room = new Room("ABCDE", io, onEmpty, () => 0);
  const join = (name: string) => {
    const socketId = `s-${name}`;
    const res = room.join({ sessionId: randomUUID(), socketId, name, color: "#d4ff3f" });
    if (!res.ok) throw new Error(res.message);
    return { id: res.playerId!, socketId };
  };
  const state = () => room.state();
  const lastTo = (to: string, event: string) => [...sent].reverse().find((s) => s.to === to && s.event === event);
  const chatTo = (to: string) => sent.filter((s) => s.to === to && s.event === "chat:line").map((s) => s.args[0] as ChatLine);
  return { room, sent, join, state, lastTo, chatTo, onEmpty };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("Room", () => {
  it("makes the first player host and passes host on when they leave", () => {
    const { room, join, state } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    expect(state().hostId).toBe(a.id);
    room.leave(a.id);
    expect(state().hostId).toBe(b.id);
  });

  it("only lets the host change settings, and validates them", () => {
    const { room, join, state } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    expect(room.updateSettings(b.id, { rounds: 5 }).ok).toBe(false);
    room.updateSettings(a.id, { rounds: 5, drawTime: 999, categories: ["animals", "nope"], maxPlayers: 99 });
    const s = state().settings;
    expect(s.rounds).toBe(5);
    expect(s.drawTime).toBe(80);
    expect(s.categories).toEqual(["animals"]);
    expect(s.maxPlayers).toBe(20);
  });

  it("needs two players to start", () => {
    const { room, join } = setup();
    const a = join("Rina");
    expect(room.start(a.id).ok).toBe(false);
    join("Bayu");
    expect(room.start(a.id).ok).toBe(true);
  });

  it("runs a turn: choose, hide the word from guessers, score a correct guess, reveal", () => {
    const { room, join, state, lastTo, sent } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    const c = join("Mei");
    room.start(a.id);
    expect(state().phase).toBe("choosing");
    expect(state().drawerId).toBe(a.id);
    expect(lastTo(a.socketId, "turn:choices")).toBeDefined();
    expect(lastTo(b.socketId, "turn:choices")).toBeUndefined();

    room.choose(a.id, 0);
    const word = room.currentWord!;
    expect(state().phase).toBe("drawing");
    // Nothing sent to the whole room contains the answer.
    const roomPayloads = JSON.stringify(sent.filter((s) => s.to === "room").map((s) => s.args));
    expect(roomPayloads.includes(`"${word}"`)).toBe(false);
    expect(state().hint!.pattern.every((ch) => ch === "_" || ch === " " || ch === "-")).toBe(true);

    vi.advanceTimersByTime(10_000);
    room.chat(b.id, word.toUpperCase());
    const bayu = state().players.find((p) => p.id === b.id)!;
    expect(bayu.guessed).toBe(true);
    expect(bayu.score).toBeGreaterThan(400);
    expect(lastTo(b.socketId, "turn:word")).toBeDefined();
    expect(state().phase).toBe("drawing");

    room.chat(c.id, word);
    expect(state().phase).toBe("reveal");
    expect(state().revealWord).toBe(word);
    expect(state().endReason).toBe("all-guessed");
    const drawer = state().players.find((p) => p.id === a.id)!;
    expect(drawer.score).toBe(300);
  });

  it("sends solver chat only to solvers and the drawer", () => {
    const { room, join, chatTo } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    const c = join("Mei");
    room.start(a.id);
    room.choose(a.id, 0);
    room.chat(b.id, room.currentWord!);
    room.chat(b.id, "that was easy");
    expect(chatTo(b.socketId).some((l) => l.text === "that was easy")).toBe(true);
    expect(chatTo(a.socketId).some((l) => l.text === "that was easy")).toBe(true);
    expect(chatTo(c.socketId).some((l) => l.text === "that was easy")).toBe(false);
    expect(chatTo("room").some((l) => l.text === "that was easy")).toBe(false);
  });

  it("tells only the guesser when a guess is close", () => {
    const { room, join, chatTo } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    join("Mei");
    room.updateSettings(a.id, { customWords: ["giraffe", "giraffe2", "zebra"], customOnly: true, wordChoices: 2 });
    room.start(a.id);
    const idx = 0;
    room.choose(a.id, idx);
    const word = room.currentWord!;
    const close = word.slice(0, -1);
    room.chat(b.id, close);
    expect(chatTo(b.socketId).some((l) => l.kind === "close")).toBe(true);
    expect(chatTo("room").some((l) => l.text === close)).toBe(false);
  });

  it("ends the turn on time, reveals hints along the way, then moves to the next drawer", () => {
    const { room, join, state } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    room.updateSettings(a.id, { customWords: ["watermelon", "pineapple", "chocolate"], customOnly: true });
    room.start(a.id);
    room.choose(a.id, 0);
    const shown = () => state().hint!.pattern.filter((ch) => ch !== "_" && ch !== " " && ch !== "-").length;
    expect(shown()).toBe(0);
    vi.advanceTimersByTime(41_000);
    expect(shown()).toBe(1);
    vi.advanceTimersByTime(20_000);
    expect(shown()).toBe(2);
    vi.advanceTimersByTime(20_000);
    expect(state().phase).toBe("reveal");
    expect(state().endReason).toBe("time-up");
    vi.advanceTimersByTime(6_000);
    expect(state().phase).toBe("choosing");
    expect(state().drawerId).toBe(b.id);
  });

  it("auto-picks a word when the drawer doesn't choose", () => {
    const { room, join, state } = setup();
    const a = join("Rina");
    join("Bayu");
    room.start(a.id);
    vi.advanceTimersByTime(15_000);
    expect(state().phase).toBe("drawing");
  });

  it("finishes after the last round and can play again", () => {
    const { room, join, state, sent } = setup();
    const a = join("Rina");
    join("Bayu");
    room.updateSettings(a.id, { rounds: 2 });
    room.start(a.id);
    for (let turn = 0; turn < 4; turn++) {
      room.choose(state().drawerId!, 0);
      vi.advanceTimersByTime(80_000 + 6_000);
    }
    expect(state().phase).toBe("podium");
    expect(sent.some((s) => s.event === "game:gallery")).toBe(true);
    expect(room.again(a.id).ok).toBe(true);
    expect(state().phase).toBe("lobby");
  });

  it("skips the turn when the drawer disconnects, and stops the game below 2 players", () => {
    const { room, join, state } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    join("Mei");
    room.start(a.id);
    room.choose(a.id, 0);
    room.disconnect(a.id);
    expect(state().phase).toBe("reveal");
    expect(state().endReason).toBe("drawer-left");
    room.leave(b.id);
    expect(state().phase).toBe("lobby");
  });

  it("keeps a seat for a reconnecting player within the grace period", () => {
    const { room, join, state } = setup();
    join("Rina");
    const sessionId = randomUUID();
    const first = room.join({ sessionId, socketId: "s1", name: "Bayu", color: "#ff8a3d" });
    room.disconnect(first.playerId!);
    vi.advanceTimersByTime(10_000);
    const again = room.join({ sessionId, socketId: "s2", name: "Bayu", color: "#ff8a3d" });
    expect(again.playerId).toBe(first.playerId);
    expect(state().players).toHaveLength(2);
    room.disconnect(first.playerId!);
    vi.advanceTimersByTime(31_000);
    expect(state().players).toHaveLength(1);
  });

  it("only accepts drawing from the drawer and replays it to late joiners", () => {
    const { room, join, sent } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    room.start(a.id);
    room.choose(a.id, 0);
    room.drawBegin(b.id, { kind: "stroke", id: "x1", color: "#16171c", size: 10, tool: "pen", points: [1, 1] });
    room.drawBegin(a.id, { kind: "stroke", id: "a1", color: "#16171c", size: 10, tool: "pen", points: [1, 1] });
    room.drawPoints(a.id, { id: "a1", points: [5, 5, 9, 9] });
    const late = room.join({ sessionId: randomUUID(), socketId: "late", name: "Mei", color: "#3fa9f5" });
    expect(late.ok).toBe(true);
    const sync = sent.find((s) => s.to === "late" && s.event === "draw:sync")!;
    const actions = sync.args[0] as { id: string; points: number[] }[];
    expect(actions).toHaveLength(1);
    expect(actions[0].id).toBe("a1");
    expect(actions[0].points).toEqual([1, 1, 5, 5, 9, 9]);
    room.drawUndo(a.id);
    expect((room.state() as RoomState).phase).toBe("drawing");
  });

  it("rejects joins when the room is full", () => {
    const { room, join } = setup();
    const a = join("Rina");
    room.updateSettings(a.id, { maxPlayers: 2 });
    join("Bayu");
    const res = room.join({ sessionId: randomUUID(), socketId: "s3", name: "Mei", color: "#3fa9f5" });
    expect(res.ok).toBe(false);
  });

  it("reports empty when everyone leaves", () => {
    const { room, join, onEmpty } = setup();
    const a = join("Rina");
    room.leave(a.id);
    expect(onEmpty).toHaveBeenCalledWith("ABCDE");
  });
});
