import { CATEGORIES } from "../../../shared/words";
import type { Settings, WordChoice } from "../../../shared/types";

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
  const picks: WordChoice[] = [];
  const taken = new Set<string>();
  let guard = 0;
  while (picks.length < count && guard++ < 1000 && taken.size < fresh.length) {
    const w = fresh[Math.floor(rng() * fresh.length)];
    if (taken.has(w.word)) continue;
    taken.add(w.word);
    picks.push(w);
  }
  return picks;
}
