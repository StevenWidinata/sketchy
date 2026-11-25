import { CATEGORIES } from "../../../shared/words.js";
import type { Settings, WordChoice } from "../../../shared/types.js";

export function buildPool(settings: Settings): WordChoice[] {
  const custom = settings.customWords.map((word) => ({ word, categoryId: "custom" }));
  if (settings.customOnly) return custom;
  const chosen = settings.categories.length
    ? CATEGORIES.filter((c) => settings.categories.includes(c.id))
    : CATEGORIES;
  const langIndex = settings.language === "id" ? 1 : 0;
  const pool: WordChoice[] = [];
  for (const cat of chosen) {
    for (const pair of cat.words) pool.push({ word: pair[langIndex], categoryId: cat.id });
  }
  return pool.concat(custom);
}

/** Pick `count` distinct words, avoiding ones already used this game until the pool runs dry. */
export function pickChoices(
  settings: Settings,
  count: number,
  used: Set<string>,
  rng: () => number = Math.random,
): WordChoice[] {
  const pool = buildPool(settings);
  let fresh = pool.filter((w) => !used.has(w.word));
  if (fresh.length < count) {
    used.clear();
    fresh = pool;
  }
  // Partial Fisher-Yates shuffle over unique words: always returns `count` distinct picks when available.
  const unique = [...new Map(fresh.map((w) => [w.word, w])).values()];
  const picks: WordChoice[] = [];
  for (let i = 0; i < Math.min(count, unique.length); i++) {
    const j = i + Math.floor(rng() * (unique.length - i));
    [unique[i], unique[j]] = [unique[j], unique[i]];
    picks.push(unique[i]);
  }
  return picks;
}
