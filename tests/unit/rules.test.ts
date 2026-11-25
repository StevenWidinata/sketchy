import { describe, expect, it } from "vitest";
import {
  checkGuess,
  cleanCustomWords,
  cleanText,
  drawerPoints,
  guessPoints,
  hintCount,
  hintOrder,
  normalize,
  revealPattern,
} from "../../server/src/game/rules";
import { buildPool, pickChoices } from "../../server/src/game/wordPool";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import { CATEGORIES } from "../../shared/words";
import type { Settings } from "../../shared/types";

const settings = (patch: Partial<Settings> = {}): Settings => ({ ...DEFAULT_SETTINGS, categories: [], customWords: [], ...patch });

describe("guess checking", () => {
  it("ignores case, spaces, hyphens and accents", () => {
    expect(checkGuess("Nasi Goreng", "nasi goreng")).toBe("correct");
    expect(checkGuess("  nasigoreng ", "nasi goreng")).toBe("correct");
    expect(checkGuess("kura kura", "kura-kura")).toBe("correct");
    expect(checkGuess("pinata", "piñata")).toBe("correct");
    expect(checkGuess("GIRAFFE!", "giraffe")).toBe("correct");
  });

  it("flags guesses one letter off as close", () => {
    expect(checkGuess("girafe", "giraffe")).toBe("close");
    expect(checkGuess("jerapa", "jerapah")).toBe("close");
    expect(checkGuess("giraffes", "giraffe")).toBe("close");
  });

  it("does not call short words or far guesses close", () => {
    expect(checkGuess("cap", "cat")).toBe("wrong");
    expect(checkGuess("horse", "giraffe")).toBe("wrong");
    expect(checkGuess("", "giraffe")).toBe("wrong");
    expect(checkGuess("!!!", "giraffe")).toBe("wrong");
  });

  it("normalizes text", () => {
    expect(normalize("  Hot-Air   Balloon ")).toBe("hot air balloon");
  });
});

describe("scoring", () => {
  it("rewards speed and order", () => {
    const fast = guessPoints(70, 80, 0);
    const slow = guessPoints(10, 80, 0);
    expect(fast).toBeGreaterThan(slow);
    expect(guessPoints(80, 80, 0)).toBe(550);
    expect(guessPoints(0, 80, 5)).toBe(50);
    expect(guessPoints(40, 80, 1)).toBeGreaterThan(guessPoints(40, 80, 2));
  });

  it("gives the drawer a share of the max for each solver", () => {
    expect(drawerPoints(0, 4)).toBe(0);
    expect(drawerPoints(2, 4)).toBe(150);
    expect(drawerPoints(4, 4)).toBe(300);
    expect(drawerPoints(3, 0)).toBe(0);
  });
});

describe("hints", () => {
  it("reveals more letters for longer words, never separators", () => {
    expect(hintCount(3)).toBe(0);
    expect(hintCount(5)).toBe(1);
    expect(hintCount(9)).toBe(2);
    const order = hintOrder("hot air balloon", () => 0.3);
    expect(order).toHaveLength(2);
    for (const i of order) expect("hot air balloon"[i]).not.toBe(" ");
  });

  it("builds patterns with separators kept", () => {
    expect(revealPattern("kura-kura", [0])).toEqual(["k", "_", "_", "_", "-", "_", "_", "_", "_"]);
    expect(revealPattern("ice cream", [])).toEqual(["_", "_", "_", " ", "_", "_", "_", "_", "_"]);
  });
});

describe("input cleaning", () => {
  it("strips control and bidi characters and caps length", () => {
    expect(cleanText("he‮llo\u0000  world", 100)).toBe("hello world");
    expect(cleanText("x".repeat(50), 20)).toHaveLength(20);
  });

  it("dedupes custom words and drops tiny ones", () => {
    expect(cleanCustomWords(["Cat", "cat", " c ", "office plant", "OFFICE-PLANT"])).toEqual(["cat", "office plant"]);
  });
});

describe("word pool", () => {
  it("has 20 categories with words in both languages", () => {
    expect(CATEGORIES).toHaveLength(20);
    for (const c of CATEGORIES) {
      expect(c.words.length).toBeGreaterThanOrEqual(25);
      for (const [en, id] of c.words) {
        expect(en.trim()).toBe(en);
        expect(id.trim()).toBe(id);
        expect(en.length).toBeGreaterThan(1);
        expect(id.length).toBeGreaterThan(1);
      }
    }
  });

  it("filters by category and language", () => {
    const pool = buildPool(settings({ categories: ["animals"], language: "id" }));
    expect(pool.every((w) => w.categoryId === "animals")).toBe(true);
    expect(pool.map((w) => w.word)).toContain("jerapah");
  });

  it("uses only custom words when asked", () => {
    const pool = buildPool(settings({ customWords: ["office plant", "karaoke"], customOnly: true }));
    expect(pool).toEqual([
      { word: "office plant", categoryId: "custom" },
      { word: "karaoke", categoryId: "custom" },
    ]);
  });

  it("picks distinct words and avoids repeats until the pool runs dry", () => {
    const s = settings({ customWords: ["a1", "b2", "c3", "d4"], customOnly: true });
    const used = new Set<string>();
    const first = pickChoices(s, 2, used);
    expect(new Set(first.map((w) => w.word)).size).toBe(2);
    first.forEach((w) => used.add(w.word));
    const second = pickChoices(s, 2, used);
    expect(second.some((w) => used.has(w.word))).toBe(false);
  });
});
