import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { AWAY_MS, Game, REMOVE_MS, newRoom, type Effect } from "../../server/src/game/engine";

const T0 = 1_800_000_000_000;

function setup() {
  const game = new Game(newRoom("ABCDE"), () => 0);
  let now = T0;
  const join = (name: string) => {
    const id = randomUUID();
    const r = game.join({ id, name, color: "#d4ff3f" }, now);
    if (!r.ok) throw new Error(r.message);
    return id;
  };
  /** Advance the clock; everyone in `alive` keeps heartbeating. */
  const tick = (ms: number, alive: string[] = game.data.players.map((p) => p.id)) => {
    const step = 5_000;
    for (let t = 0; t < ms; t += step) {
      now += Math.min(step, ms - t);
      for (const id of alive) game.touch(id, now);
      game.advance(now);
    }
  };
  const state = () => game.state(now, 1);
  const chats = (scope?: "room" | "solved") =>
    game.effects.filter((e): e is Extract<Effect, { kind: "chat" }> => e.kind === "chat" && (!scope || e.scope === scope)).map((e) => e.line);
  return { game, join, tick, state, chats, now: () => now };
}

describe("Game", () => {
  it("makes the first player host and passes host on when they leave", () => {
    const { game, join, state, now } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    expect(state().hostId).toBe(a);
    game.leave(a, now());
    expect(state().hostId).toBe(b);
  });

  it("only lets the host change settings, and validates them", () => {
    const { game, join, state } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    expect(game.updateSettings(b, { rounds: 5 }).ok).toBe(false);
    game.updateSettings(a, { rounds: 5, drawTime: 999, categories: ["animals", "nope"], maxPlayers: 99 });
    const s = state().settings;
    expect(s.rounds).toBe(5);
    expect(s.drawTime).toBe(80);
    expect(s.categories).toEqual(["animals"]);
    expect(s.maxPlayers).toBe(20);
  });

  it("needs two players to start", () => {
    const { game, join, now } = setup();
    const a = join("Rina");
    expect(game.start(a, now()).ok).toBe(false);
    join("Bayu");
    expect(game.start(a, now()).ok).toBe(true);
  });

  it("runs a turn: choose, hide the word, score a correct guess, reveal", () => {
    const { game, join, state, tick, now } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    const c = join("Mei");
    game.start(a, now());
    expect(state().phase).toBe("choosing");
    expect(state().turnId).toBe(1);
    expect(game.privateFor(a).choices).toHaveLength(3);
    expect(game.privateFor(b).choices).toBeUndefined();

    game.choose(a, 0, now());
    const word = game.data.word!.word;
    expect(state().phase).toBe("drawing");
    expect(JSON.stringify(state()).includes(`"${word}"`)).toBe(false);
    expect(game.privateFor(b).word).toBeUndefined();
    expect(game.privateFor(a).word?.word).toBe(word);

    tick(10_000);
    game.chat(b, word.toUpperCase(), now());
    const bayu = state().players.find((p) => p.id === b)!;
    expect(bayu.guessed).toBe(true);
    expect(bayu.score).toBeGreaterThan(400);
    expect(game.privateFor(b).word?.word).toBe(word);

    game.chat(c, word, now());
    game.advance(now());
    expect(state().phase).toBe("reveal");
    expect(state().revealWord).toBe(word);
    expect(state().endReason).toBe("all-guessed");
    expect(state().players.find((p) => p.id === a)!.score).toBe(300);
    expect(game.effects.some((e) => e.kind === "turnEnded")).toBe(true);
  });

  it("routes solver chat to the solved channel only", () => {
    const { game, join, chats, now } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    join("Mei");
    game.start(a, now());
    game.choose(a, 0, now());
    game.chat(b, game.data.word!.word, now());
    game.chat(b, "that was easy", now());
    expect(chats("solved").some((l) => l.text === "that was easy")).toBe(true);
    expect(chats("room").some((l) => l.text === "that was easy")).toBe(false);
  });

  it("tells only the guesser when a guess is close", () => {
    const { game, join, chats, now } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    join("Mei");
    game.updateSettings(a, { customWords: ["giraffe", "zebra", "camel"], customOnly: true, wordChoices: 2 });
    game.start(a, now());
    game.choose(a, 0, now());
    const close = game.data.word!.word.slice(0, -1);
    game.chat(b, close, now());
    expect(game.privateLines.some((l) => l.kind === "close")).toBe(true);
    expect(chats().some((l) => l.text === close)).toBe(false);
  });

  it("reveals hints over time, ends on time, then moves to the next drawer", () => {
    const { game, join, state, tick, now } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    game.updateSettings(a, { customWords: ["watermelon", "pineapple", "chocolate"], customOnly: true });
    game.start(a, now());
    game.choose(a, 0, now());
    const shown = () => state().hint!.pattern.filter((ch) => ch !== "_" && ch !== " " && ch !== "-").length;
    expect(state().hintTimes).toHaveLength(2);
    expect(shown()).toBe(0);
    tick(41_000);
    expect(shown()).toBe(1);
    tick(20_000);
    expect(shown()).toBe(2);
    tick(20_000);
    expect(state().phase).toBe("reveal");
    expect(state().endReason).toBe("time-up");
    tick(6_000);
    expect(state().phase).toBe("choosing");
    expect(state().drawerId).toBe(b);
    expect(state().turnId).toBe(2);
  });

  it("runs a Speed round: 30 s turns with hints at a third and two thirds", () => {
    const { game, join, state, tick, now } = setup();
    const a = join("Rina");
    join("Bayu");
    game.updateSettings(a, { mode: "speed", drawTime: 120, customWords: ["watermelon", "pineapple", "chocolate"], customOnly: true });
    expect(state().settings.mode).toBe("speed");
    game.start(a, now());
    game.choose(a, 0, now());
    expect(state().phaseEndsAt! - now()).toBe(30_000);
    const shown = () => state().hint!.pattern.filter((ch) => ch !== "_" && ch !== " " && ch !== "-").length;
    tick(11_000);
    expect(shown()).toBe(1);
    tick(10_000);
    expect(shown()).toBe(2);
    tick(10_000);
    expect(state().phase).toBe("reveal");
    expect(state().endReason).toBe("time-up");
  });

  it("offers easy, medium and hard words and pays more for the hard one", () => {
    const { game, join, state, now } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    game.updateSettings(a, { categories: ["animals"] });
    game.start(a, now());
    expect(game.privateFor(a).choices!.map((c) => c.difficulty)).toEqual(["easy", "medium", "hard"]);
    game.choose(a, 2, now());
    game.chat(b, game.data.word!.word, now());
    game.advance(now());
    expect(state().phase).toBe("reveal");
    expect(state().revealDifficulty).toBe("hard");
    expect(state().players.find((p) => p.id === a)!.score).toBe(450);
  });

  it("treats rooms saved before Speed rounds as classic", () => {
    const { game, join, state } = setup();
    join("Rina");
    delete (game.data.settings as Partial<typeof game.data.settings>).mode;
    expect(state().settings.mode).toBe("classic");
  });

  it("catches up on several deadlines in one request", () => {
    const { game, join, state, now } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    game.start(a, now());
    // Nobody sent a request for 25 seconds, but both are still within the away window.
    const later = now() + 20_000;
    game.touch(a, later);
    game.touch(b, later);
    game.advance(later);
    expect(state().phase).toBe("drawing");
  });

  it("auto-picks a word when the drawer doesn't choose", () => {
    const { game, join, state, tick, now } = setup();
    const a = join("Rina");
    join("Bayu");
    game.start(a, now());
    tick(16_000);
    expect(state().phase).toBe("drawing");
  });

  it("finishes after the last round and can play again", () => {
    const { game, join, state, tick, now } = setup();
    const a = join("Rina");
    join("Bayu");
    game.updateSettings(a, { rounds: 2 });
    game.start(a, now());
    for (let turn = 0; turn < 4; turn++) {
      game.choose(state().drawerId!, 0, now());
      tick(80_000 + 6_000);
    }
    expect(state().phase).toBe("podium");
    expect(game.effects.some((e) => e.kind === "gameOver")).toBe(true);
    expect(game.again(a).ok).toBe(true);
    expect(state().phase).toBe("lobby");
  });

  it("never shows a word twice in a game, even ones the drawer skipped, and starts fresh next game", () => {
    const { game, join, state, tick, now } = setup();
    const a = join("Rina");
    join("Bayu");
    game.updateSettings(a, { rounds: 8, categories: ["animals"] });
    game.start(a, now());
    const shown: string[] = [];
    for (let turn = 0; turn < 16; turn++) {
      const drawer = state().drawerId!;
      shown.push(...game.privateFor(drawer).choices!.map((c) => c.word));
      game.choose(drawer, 0, now());
      tick(80_000 + 6_000);
    }
    expect(state().phase).toBe("podium");
    expect(shown).toHaveLength(48);
    expect(new Set(shown).size).toBe(48);

    game.again(a);
    expect(game.start(a, now()).ok).toBe(true);
    expect(game.data.usedWords).toHaveLength(3);
  });

  it("skips the turn when the drawer goes away, and stops the game below 2 players", () => {
    const { game, join, state, tick, now } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    const c = join("Mei");
    game.start(a, now());
    game.choose(a, 0, now());
    tick(AWAY_MS + 5_000, [b, c]);
    expect(state().phase).toBe("reveal");
    expect(state().endReason).toBe("drawer-left");
    game.leave(b, now());
    game.advance(now());
    expect(state().phase).toBe("lobby");
  });

  it("marks quiet players away, then removes them", () => {
    const { join, state, tick } = setup();
    join("Rina");
    const b = join("Bayu");
    const a = state().players[0].id;
    tick(AWAY_MS + 5_000, [a]);
    expect(state().players.find((p) => p.id === b)!.connected).toBe(false);
    tick(REMOVE_MS, [a]);
    expect(state().players.find((p) => p.id === b)).toBeUndefined();
  });

  it("keeps the seat and score when a player rejoins", () => {
    const { game, join, state, now } = setup();
    const a = join("Rina");
    const b = join("Bayu");
    game.data.players.find((p) => p.id === b)!.score = 420;
    expect(game.join({ id: b, name: "Bayu", color: "#ff8a3d" }, now() + 1000).ok).toBe(true);
    expect(state().players).toHaveLength(2);
    expect(state().players.find((p) => p.id === b)!.score).toBe(420);
    expect(state().hostId).toBe(a);
  });

  it("rejects joins when the room is full", () => {
    const { game, join, now } = setup();
    const a = join("Rina");
    game.updateSettings(a, { maxPlayers: 2 });
    join("Bayu");
    expect(game.join({ id: randomUUID(), name: "Mei", color: "#3fa9f5" }, now()).ok).toBe(false);
  });

  it("is empty once everyone leaves", () => {
    const { game, join, now } = setup();
    const a = join("Rina");
    game.leave(a, now());
    expect(game.isEmpty).toBe(true);
  });

  it("survives a JSON round trip, as it does through the database", () => {
    const { game, join, now } = setup();
    const a = join("Rina");
    join("Bayu");
    game.start(a, now());
    const copy = new Game(JSON.parse(JSON.stringify(game.data)));
    expect(copy.state(now(), 1)).toEqual(game.state(now(), 1));
  });
});
