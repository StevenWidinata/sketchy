import { CATEGORIES } from "../../../shared/words.js";
import type { Settings, WordChoice } from "../../../shared/types.js";

/** A word plus a key that stays the same in English and Indonesian, so switching language doesn't reset what's been seen. */
export interface PoolWord extends WordChoice {
  key: string;
}

const customKey = (word: string) => `custom:${word.trim().toLowerCase()}`;

export function buildPool(settings: Settings): PoolWord[] {
  const custom = settings.customWords.map((word) => ({ word, categoryId: "custom", key: customKey(word) }));
  if (settings.customOnly) return custom;
  // No pick from the host means every normal category; the hard ones only play when ticked.
  const chosen = settings.categories.length ? CATEGORIES.filter((c) => settings.categories.includes(c.id)) : CATEGORIES.filter((c) => !c.hard);
  const langIndex = settings.language === "id" ? 1 : 0;
  const pool: PoolWord[] = [];
  for (const cat of chosen) {
    for (const pair of cat.words) pool.push({ word: pair[langIndex], categoryId: cat.id, key: pair[0] });
  }
  return pool.concat(custom);
}

/**
 * Pick `count` distinct words nobody has seen this game. `seen` lists keys oldest first.
 * Only when the fresh words run out do seen ones come back, the ones seen longest ago first.
 */
export function pickChoices(settings: Settings, count: number, seen: readonly string[], rng: () => number = Math.random): PoolWord[] {
  const unique = [...new Map(buildPool(settings).map((w) => [w.key, w])).values()];
  const seenAt = new Map(seen.map((k, i) => [k, i]));
  const fresh = unique.filter((w) => !seenAt.has(w.key));
  // Partial Fisher-Yates shuffle over the fresh words.
  const picks: PoolWord[] = [];
  for (let i = 0; i < Math.min(count, fresh.length); i++) {
    const j = i + Math.floor(rng() * (fresh.length - i));
    [fresh[i], fresh[j]] = [fresh[j], fresh[i]];
    picks.push(fresh[i]);
  }
  if (picks.length < count) {
    const oldest = unique.filter((w) => seenAt.has(w.key)).sort((a, b) => seenAt.get(a.key)! - seenAt.get(b.key)!);
    picks.push(...oldest.slice(0, count - picks.length));
  }
  return picks;
}
