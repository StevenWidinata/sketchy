import { CATEGORIES } from "../../../shared/words.js";
import type { Difficulty, Settings, WordChoice } from "../../../shared/types.js";

/** A word plus a key that stays the same in English and Indonesian, so switching language doesn't reset what's been seen. */
export interface PoolWord extends WordChoice {
  key: string;
}

const customKey = (word: string) => `custom:${word.trim().toLowerCase()}`;

/** Custom words have no label and play as medium. */
export const levelOf = (w: WordChoice): Difficulty => w.difficulty ?? "medium";

const RANK: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

/** Which level each choice slot asks for: one of each, easy first. */
export function choicePlan(count: number): Difficulty[] {
  if (count <= 1) return ["medium"];
  if (count === 2) return ["easy", "hard"];
  if (count === 3) return ["easy", "medium", "hard"];
  return ["easy", ...Array<Difficulty>(count - 2).fill("medium"), "hard"];
}

/** When a level has no fresh words left, the closest level fills in. */
const FALLBACK: Record<Difficulty, Difficulty[]> = {
  easy: ["easy", "medium", "hard"],
  medium: ["medium", "easy", "hard"],
  hard: ["hard", "medium", "easy"],
};

export function buildPool(settings: Settings): PoolWord[] {
  const custom = settings.customWords.map((word) => ({ word, categoryId: "custom", key: customKey(word) }));
  if (settings.customOnly) return custom;
  // No pick from the host means every normal category; the hard ones only play when ticked.
  const chosen = settings.categories.length ? CATEGORIES.filter((c) => settings.categories.includes(c.id)) : CATEGORIES.filter((c) => !c.hard);
  const langIndex = settings.language === "id" ? 1 : 0;
  const pool: PoolWord[] = [];
  for (const cat of chosen) {
    for (const entry of cat.words) pool.push({ word: entry[langIndex], categoryId: cat.id, key: entry[0], difficulty: entry[2] });
  }
  return pool.concat(custom);
}

/**
 * Pick `count` distinct words nobody has seen this game, one of each difficulty (see `choicePlan`), easiest first.
 * `seen` lists keys oldest first. Only when fresh words run out do seen ones come back, the ones seen longest ago first.
 */
export function pickChoices(settings: Settings, count: number, seen: readonly string[], rng: () => number = Math.random): PoolWord[] {
  const unique = [...new Map(buildPool(settings).map((w) => [w.key, w])).values()];
  const seenAt = new Map(seen.map((k, i) => [k, i]));
  const fresh = unique.filter((w) => !seenAt.has(w.key));
  // Shuffle the fresh words once; each slot then takes the first match of its level.
  for (let i = fresh.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [fresh[i], fresh[j]] = [fresh[j], fresh[i]];
  }
  const taken = new Set<string>();
  const picks: PoolWord[] = [];
  for (const level of choicePlan(count)) {
    for (const want of FALLBACK[level]) {
      const hit = fresh.find((w) => !taken.has(w.key) && levelOf(w) === want);
      if (hit) {
        taken.add(hit.key);
        picks.push(hit);
        break;
      }
    }
  }
  if (picks.length < count) {
    const oldest = unique.filter((w) => seenAt.has(w.key) && !taken.has(w.key)).sort((a, b) => seenAt.get(a.key)! - seenAt.get(b.key)!);
    picks.push(...oldest.slice(0, count - picks.length));
  }
  // Stable sort keeps fresh words ahead of recycled ones within a level.
  return picks.sort((a, b) => RANK[levelOf(a)] - RANK[levelOf(b)]);
}
