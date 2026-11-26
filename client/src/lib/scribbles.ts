/**
 * Abstract marker scribbles for the paper background: loops, spirals, zigzags, stars, hearts and so on.
 * Every shape is a list of points with a little hand wobble, so nothing looks like clean geometry.
 * Layouts come from a jittered grid with one seed per cell, so the same page always gets the same doodles,
 * and a page that grows only adds new ones at the bottom.
 */
import { useEffect } from "react";
import { AVATAR_COLORS } from "../../../shared/constants";

export type Pt = [number, number];

export interface ScribbleShape {
  /** Strokes in local pixels around (0, 0), drawn in order. */
  strokes: Pt[][];
  /** Running length at the end of each stroke, for the draw-in. */
  ends: number[];
  length: number;
  dashed: boolean;
  /** Distance from the center to the farthest point. */
  radius: number;
}

export interface Scribble {
  key: string;
  shape: ScribbleShape;
  color: string;
  width: number;
  alpha: number;
  /** Center in document coordinates. */
  x: number;
  y: number;
  rot: number;
}

export type ScribbleMode = "full" | "calm";

/* ---------- seeded randomness ---------- */

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cellSeed(i: number, j: number, salt: number) {
  return (Math.imul(i + 1013, 73856093) ^ Math.imul(j + 7919, 19349663) ^ Math.imul(salt, 83492791)) >>> 0;
}

/* ---------- shapes ---------- */

const TAU = Math.PI * 2;

type Gen = (s: number, r: () => number) => { strokes: Pt[][]; dashed?: boolean };

const sample = (n: number, f: (t: number) => Pt): Pt[] => Array.from({ length: n + 1 }, (_, k) => f(k / n));

/** Straight segments cut into short steps, so wobble and draw-in work along them. */
function densify(pts: Pt[], step = 4): Pt[] {
  const out: Pt[] = [pts[0]];
  for (let k = 1; k < pts.length; k++) {
    const [ax, ay] = pts[k - 1];
    const [bx, by] = pts[k];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step));
    for (let m = 1; m <= n; m++) out.push([ax + ((bx - ax) * m) / n, ay + ((by - ay) * m) / n]);
  }
  return out;
}

const GENS: Record<string, Gen> = {
  spiral: (s, r) => {
    const turns = 2.2 + r() * 0.9;
    const squash = 0.82 + r() * 0.18;
    const p = r() * TAU;
    return {
      strokes: [
        sample(150, (t) => {
          const rad = s * (0.05 + 0.43 * t);
          const a = p + t * turns * TAU;
          return [Math.cos(a) * rad, Math.sin(a) * rad * squash];
        }),
      ],
    };
  },
  coil: (s, r) => {
    const loops = 4 + Math.floor(r() * 3);
    const rad = s * (0.13 + r() * 0.04);
    const c = s / (loops * TAU);
    return {
      strokes: [
        sample(loops * 34, (t) => {
          const a = t * loops * TAU;
          return [c * a - rad * Math.sin(a) - s / 2, -rad * Math.cos(a)];
        }),
      ],
    };
  },
  zigzag: (s, r) => {
    const teeth = 5 + Math.floor(r() * 4);
    const h = s * (0.14 + r() * 0.08);
    return { strokes: [densify(Array.from({ length: teeth + 1 }, (_, k): Pt => [-s / 2 + (s * k) / teeth, k % 2 ? -h : h]))] };
  },
  star: (s, r) => {
    const R = s * 0.48;
    const inner = R * (0.4 + r() * 0.08);
    const pts: Pt[] = [];
    for (let k = 0; k <= 10; k++) {
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      const rr = k % 2 ? inner : R;
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    // Overshoot the start a little, like a quick pen.
    const [x0, y0] = pts[0];
    const [x1, y1] = pts[1];
    pts.push([x0 + (x1 - x0) * 0.18, y0 + (y1 - y0) * 0.18]);
    return { strokes: [densify(pts)] };
  },
  heart: (s) => {
    const k = s / 34;
    return {
      strokes: [
        sample(120, (t) => {
          const a = Math.PI + t * (TAU + 0.35);
          return [16 * Math.sin(a) ** 3 * k, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * k];
        }),
      ],
    };
  },
  wave: (s, r) => {
    const periods = 2 + r() * 1.2;
    const amp = s * (0.1 + r() * 0.06);
    return { strokes: [sample(110, (t) => [-s / 2 + t * s, Math.sin(t * periods * TAU) * amp])] };
  },
  ball: (s, r) => {
    const loops = 5 + Math.floor(r() * 3);
    const aspect = 0.65 + r() * 0.3;
    const p1 = r() * TAU;
    const p2 = r() * TAU;
    return {
      strokes: [
        sample(loops * 40, (t) => {
          const a = t * loops * TAU;
          const rad = s * 0.42 * (0.7 + 0.3 * Math.sin(t * 9 + p1));
          const cx = Math.sin(t * 5 + p2) * s * 0.06;
          const cy = Math.cos(t * 4 + p1) * s * 0.05;
          return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * aspect];
        }),
      ],
    };
  },
  arrow: (s, r) => {
    const lift = s * (0.3 + r() * 0.2);
    const shaft = sample(70, (t): Pt => {
      const u = 1 - t;
      const x = u * u * (-s / 2) + 2 * u * t * 0 + t * t * (s / 2);
      const y = u * u * (s * 0.22) + 2 * u * t * -lift + t * t * 0;
      return [x, y];
    });
    const [tx, ty] = shaft[shaft.length - 1];
    const [px, py] = shaft[shaft.length - 5];
    const ang = Math.atan2(ty - py, tx - px);
    const len = s * 0.2;
    const wing = (d: number): Pt => [tx + Math.cos(ang + Math.PI + d) * len, ty + Math.sin(ang + Math.PI + d) * len];
    return { strokes: [shaft, densify([wing(0.5), [tx, ty], wing(-0.5)])] };
  },
  ring: (s, r) => {
    const squash = 0.85 + r() * 0.15;
    const p = r() * TAU;
    return {
      dashed: true,
      strokes: [
        sample(110, (t) => {
          const a = p + t * TAU * 1.04;
          return [Math.cos(a) * s * 0.42, Math.sin(a) * s * 0.42 * squash];
        }),
      ],
    };
  },
  pentest: (s, r) => {
    const n = 10 + Math.floor(r() * 5);
    const pts: Pt[] = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const amp = s * (0.08 + 0.3 * t);
      pts.push([-s / 2 + t * s, k % 2 ? -amp : amp * 0.6]);
    }
    return { strokes: [densify(pts, 3)] };
  },
};

const NAMES = Object.keys(GENS);

/** Smooth hand wobble: a couple of slow sine waves per axis. */
function wobble(strokes: Pt[][], s: number, r: () => number): Pt[][] {
  const amp = s * 0.022;
  const f = [2 + r() * 3, 3 + r() * 4, 2 + r() * 3, 3 + r() * 4];
  const p = [r() * TAU, r() * TAU, r() * TAU, r() * TAU];
  return strokes.map((st) =>
    st.map(([x, y], k): Pt => {
      const t = k / st.length;
      return [
        x + amp * (Math.sin(t * f[0] * TAU + p[0]) + 0.5 * Math.sin(t * f[1] * TAU + p[1])),
        y + amp * (Math.sin(t * f[2] * TAU + p[2]) + 0.5 * Math.sin(t * f[3] * TAU + p[3])),
      ];
    }),
  );
}

export function makeShape(size: number, r: () => number, name = NAMES[Math.floor(r() * NAMES.length)]): ScribbleShape {
  const g = GENS[name](size, r);
  const strokes = wobble(g.strokes, size, r);
  const ends: number[] = [];
  let length = 0;
  let radius = 0;
  for (const st of strokes) {
    for (let k = 0; k < st.length; k++) {
      radius = Math.max(radius, Math.hypot(st[k][0], st[k][1]));
      if (k) length += Math.hypot(st[k][0] - st[k - 1][0], st[k][1] - st[k - 1][1]);
    }
    ends.push(length);
  }
  return { strokes, ends, length, dashed: !!g.dashed, radius };
}

/** Light hues need more opacity to show on white paper. */
const LIGHT = new Set<string>(["#d4ff3f", "#ffd23f"]);

export function randomScribble(key: string, x: number, y: number, size: number, r: () => number, mode: ScribbleMode = "full"): Scribble {
  const color = AVATAR_COLORS[Math.floor(r() * AVATAR_COLORS.length)];
  const base = mode === "full" ? 0.58 + r() * 0.17 : 0.22 + r() * 0.06;
  return {
    key,
    shape: makeShape(size, r),
    color,
    width: mode === "full" ? 3 + r() * 3 : 2.5 + r() * 1.5,
    alpha: LIGHT.has(color) ? Math.min(1, base + 0.25) : base,
    x,
    y,
    rot: (r() - 0.5) * 1.2,
  };
}

/* ---------- layout ---------- */

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const SALT = 20251125;

/**
 * The scribbles for a page of the given size, skipping anything that would sit under text, controls or panels.
 * Full mode fills about one scribble per 18,000 px² of free paper; calm mode keeps a third, smaller and fainter.
 */
export function layout(width: number, height: number, mode: ScribbleMode, clear: Rect[]): Scribble[] {
  const out: Scribble[] = [];
  // Phones have only thin strips of free paper, so they get a finer grid of smaller scribbles.
  const small = width < 700;
  const CELL = small ? 100 : 136;
  const scale = small ? 0.66 : 1;
  const cols = Math.ceil(width / CELL);
  const rows = Math.ceil(height / CELL);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const r = rng(cellSeed(i, j, SALT));
      const keep = r();
      if (mode === "calm" ? keep > 0.33 : keep > 0.92) continue;
      const size = (mode === "full" ? 46 + r() * 38 : 34 + r() * 20) * scale;
      const x = (i + 0.5 + (r() - 0.5) * 0.45) * CELL;
      const y = (j + 0.5 + (r() - 0.5) * 0.45) * CELL;
      const sc = randomScribble(`${mode}:${i}:${j}`, x, y, size, r, mode);
      // The shape's real reach, plus its marker width and a little air.
      const pad = sc.shape.radius + sc.width + (small ? 4 : 10);
      if (x - pad < 0 || x + pad > width || y - pad < 0 || y + pad > height) continue;
      if (clear.some((c) => x + pad > c.left && x - pad < c.right && y + pad > c.top && y - pad < c.bottom)) continue;
      out.push(sc);
    }
  }
  return out;
}

/* ---------- which mode the current screen wants ---------- */

let mode: ScribbleMode = "full";
let page = "";
const listeners = new Set<() => void>();

export function getScribbleMode() {
  return { mode, page };
}

export function onScribbleMode(fn: () => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

/** Screens call this to choose the background: busy paper, or quiet paper during a turn. */
export function useScribbles(next: ScribbleMode, pageKey: string) {
  useEffect(() => {
    if (next === mode && pageKey === page) return;
    mode = next;
    page = pageKey;
    document.documentElement.dataset.scribbles = next;
    listeners.forEach((l) => l());
  }, [next, pageKey]);
}
