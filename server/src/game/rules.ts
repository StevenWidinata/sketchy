import { LIMITS, SCORING } from "../../../shared/constants.js";
import type { Difficulty } from "../../../shared/types.js";

/** Lowercase, strip accents and punctuation, treat hyphens as spaces, collapse whitespace. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[-_/]/g, " ")
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

const compact = (s: string) => s.replace(/ /g, "");

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

export type GuessResult = "correct" | "close" | "wrong";

export function checkGuess(guess: string, answer: string): GuessResult {
  const g = compact(normalize(guess));
  const a = compact(normalize(answer));
  if (!g) return "wrong";
  if (g === a) return "correct";
  if (a.length >= 4 && Math.abs(g.length - a.length) <= 1 && levenshtein(g, a) === 1) return "close";
  return "wrong";
}

/** Guess points: faster is worth more, plus a bonus for the first three solvers. */
export function guessPoints(secondsLeft: number, duration: number, order: number): number {
  const share = Math.max(0, Math.min(1, secondsLeft / duration));
  const bonus = SCORING.orderBonus[order] ?? 0;
  return Math.round(SCORING.guessBase + SCORING.guessSpeed * share) + bonus;
}

/** Drawer points: share of eligible players who guessed. */
export function drawerPoints(guessed: number, eligible: number): number {
  if (eligible <= 0 || guessed <= 0) return 0;
  return Math.round(SCORING.drawerMax * Math.min(1, guessed / eligible));
}

/** Harder words are worth more, for the guessers and the drawer alike. Custom words play as medium. */
export function difficultyBonus(level: Difficulty | undefined): number {
  return level === "hard" ? 1.5 : level === "easy" ? 1 : 1.25;
}

const SEPARATORS = new Set([" ", "-"]);

export function hiddenPattern(word: string): string[] {
  return [...word].map((ch) => (SEPARATORS.has(ch) ? ch : "_"));
}

/** How many letters the game reveals over a turn, given the number of letters in the word. */
export function hintCount(letters: number): number {
  if (letters < 4) return 0;
  if (letters < 6) return 1;
  return 2;
}

/** Positions to reveal, in order, chosen at random among letter positions. */
export function hintOrder(word: string, rng: () => number = Math.random): number[] {
  const positions = [...word].map((ch, i) => (SEPARATORS.has(ch) ? -1 : i)).filter((i) => i >= 0);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  return positions.slice(0, hintCount(positions.length));
}

export function revealPattern(word: string, revealed: number[]): string[] {
  const chars = [...word];
  const pattern = hiddenPattern(word);
  for (const i of revealed) pattern[i] = chars[i];
  return pattern;
}

/** Trim, collapse whitespace, strip control characters, cap length. */
export function cleanText(text: string, max: number): string {
  return text
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function cleanCustomWords(words: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of words) {
    const word = cleanText(raw, LIMITS.wordMax).toLowerCase();
    const key = normalize(word);
    if (key.length < 2 || seen.has(key)) continue;
    seen.add(key);
    out.push(word);
    if (out.length >= LIMITS.customWordsMax) break;
  }
  return out;
}
