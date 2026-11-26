import { useEffect, useRef } from "react";
import { currentAccent } from "../lib/accent";
import { getScribbleMode, layout, onScribbleMode, randomScribble, rng, setStampHandler, type Pt, type Rect, type Scribble } from "../lib/scribbles";
import { play } from "../lib/sound";

/** Scribbles never sit under these: text, controls, pictures and panels. */
const CLEAR =
  "header,h1,h2,h3,p,li,label,a,button,input,textarea,select,img,svg:not([width='0']),canvas:not(.scribble-field),.sketch,[data-clear]";

const DRAW_MS = 450;
const STAMP_MS = 300;
const FADE_MS = 300;
const TRAIL_HOLD_MS = 500;
const TRAIL_FADE_MS = 3500;
const MAX_TRAILS = 6;
const MAX_STAMPS = 30;
const REACH = 120;
const TAP_SLOP = 6;

interface Live extends Scribble {
  start: number;
  dur: number;
  dieAt: number | null;
  ox: number;
  oy: number;
  or: number;
  vx: number;
  vy: number;
  vr: number;
}

interface Trail {
  pts: Pt[];
  color: string;
  releasedAt: number | null;
}

const live = (s: Scribble, start: number, dur: number): Live => ({ ...s, start, dur, dieAt: null, ox: 0, oy: 0, or: 0, vx: 0, vy: 0, vr: 0 });
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * The paper's doodles: one fixed canvas behind the page. Scribbles draw themselves in on load,
 * lean away from the cursor or finger, and you can doodle on empty paper (drag) or stamp a new one (tap).
 * The frame loop only runs while something moves.
 */
export function ScribbleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    let dpr = 1;
    let vw = 0;
    let vh = 0;
    const items = new Map<string, Live>();
    let stamps: Live[] = [];
    let trails: Trail[] = [];
    let stampCount = 0;
    let first = true;
    let running = false;
    let frame = 0;
    let last = 0;
    let anyDisplaced = false;
    // Pointer, in viewport and document coordinates.
    let cx = 0;
    let cy = 0;
    let inside = false;
    let down: { id: number; type: string; x: number; y: number; trail: Trail | null } | null = null;

    const reduced = () => reducedQuery.matches;
    const px = () => cx + window.scrollX;
    const py = () => cy + window.scrollY;

    const sizeCanvas = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
    };

    const clearRects = (): Rect[] => {
      const sx = window.scrollX;
      const sy = window.scrollY;
      const out: Rect[] = [];
      document.querySelectorAll(CLEAR).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        out.push({ left: r.left + sx, top: r.top + sy, right: r.right + sx, bottom: r.bottom + sy });
      });
      return out;
    };

    const onScreen = (s: Scribble) => {
      const m = s.shape.radius + 20;
      const x = s.x - window.scrollX;
      const y = s.y - window.scrollY;
      return x > -m && x < vw + m && y > -m && y < vh + m;
    };

    const rebuild = () => {
      const { mode } = getScribbleMode();
      const next = layout(root.scrollWidth, root.scrollHeight, mode, clearRects());
      const now = performance.now();
      const keys = new Set(next.map((s) => s.key));
      for (const [k, it] of items) if (!keys.has(k) && it.dieAt === null) it.dieAt = now;
      for (const s of next) {
        const existing = items.get(s.key);
        if (existing) {
          existing.dieAt = null;
          continue;
        }
        let start = now;
        let dur = 0;
        if (!reduced() && onScreen(s)) {
          dur = DRAW_MS;
          // The first draw-in sweeps from the top left over about 1.2 s; later ones just appear in a quick scatter.
          start = first
            ? now + 120 + (((s.x - window.scrollX) / vw) * 0.6 + ((s.y - window.scrollY) / vh) * 0.4) * 1100 + Math.random() * 80
            : now + Math.random() * 200;
        }
        items.set(s.key, live(s, start, dur));
      }
      first = false;
      wake();
    };

    /* ---------- drawing ---------- */

    const drawScribble = (it: Live, now: number) => {
      const p = it.dur ? clamp01((now - it.start) / it.dur) : 1;
      if (p <= 0) return;
      if (!onScreen(it)) return;
      const fade = it.dieAt === null ? 1 : 1 - clamp01((now - it.dieAt) / FADE_MS);
      if (fade <= 0) return;
      const eased = 1 - (1 - p) ** 3;
      const { strokes, ends, length, dashed } = it.shape;
      const limit = eased * length;
      ctx.save();
      ctx.translate(it.x + it.ox, it.y + it.oy);
      ctx.rotate(it.rot + it.or);
      ctx.globalAlpha = it.alpha * fade;
      ctx.strokeStyle = it.color;
      ctx.lineWidth = it.width;
      ctx.setLineDash(dashed ? [it.width * 2.4, it.width * 2.2] : []);
      ctx.beginPath();
      for (let si = 0; si < strokes.length; si++) {
        const st = strokes[si];
        let run = si ? ends[si - 1] : 0;
        if (run >= limit) break;
        ctx.moveTo(st[0][0], st[0][1]);
        if (eased >= 1) {
          for (let k = 1; k < st.length; k++) ctx.lineTo(st[k][0], st[k][1]);
          continue;
        }
        for (let k = 1; k < st.length; k++) {
          const seg = Math.hypot(st[k][0] - st[k - 1][0], st[k][1] - st[k - 1][1]);
          if (run + seg >= limit) {
            const f = seg ? (limit - run) / seg : 0;
            ctx.lineTo(st[k - 1][0] + (st[k][0] - st[k - 1][0]) * f, st[k - 1][1] + (st[k][1] - st[k - 1][1]) * f);
            break;
          }
          ctx.lineTo(st[k][0], st[k][1]);
          run += seg;
        }
      }
      ctx.stroke();
      ctx.restore();
    };

    const drawTrail = (t: Trail, now: number) => {
      const a = t.releasedAt === null ? 1 : 1 - clamp01((now - t.releasedAt - TRAIL_HOLD_MS) / TRAIL_FADE_MS);
      if (a <= 0 || t.pts.length < 2) return;
      ctx.globalAlpha = a * 0.9;
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(t.pts[0][0], t.pts[0][1]);
      for (let k = 1; k < t.pts.length - 1; k++) {
        const mx = (t.pts[k][0] + t.pts[k + 1][0]) / 2;
        const my = (t.pts[k][1] + t.pts[k + 1][1]) / 2;
        ctx.quadraticCurveTo(t.pts[k][0], t.pts[k][1], mx, my);
      }
      const end = t.pts[t.pts.length - 1];
      ctx.lineTo(end[0], end[1]);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);
      ctx.translate(-window.scrollX, -window.scrollY);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const it of items.values()) drawScribble(it, now);
      for (const it of stamps) drawScribble(it, now);
      for (const t of trails) drawTrail(t, now);
    };

    /* ---------- motion ---------- */

    /** Springs each scribble toward its push target. Returns true while anything is still moving. */
    const physics = (dt: number) => {
      const f = Math.min(3, dt / 16.67);
      const calm = getScribbleMode().mode === "calm";
      const push = calm ? 8 : 18;
      const near = inside && !reduced();
      const x = px();
      const y = py();
      let moving = false;
      anyDisplaced = false;
      const springs = (it: Live) => {
        let tx = 0;
        let ty = 0;
        let tr = 0;
        if (near) {
          const dx = it.x - x;
          const dy = it.y - y;
          const d = Math.hypot(dx, dy) || 1;
          const reach = REACH + it.shape.radius * 0.5;
          if (d < reach) {
            const k = (1 - d / reach) ** 1.5;
            tx = (dx / d) * push * k;
            ty = (dy / d) * push * k;
            tr = (dx > 0 ? 1 : -1) * 0.12 * k;
          }
        }
        it.vx = (it.vx + (tx - it.ox) * 0.14 * f) * 0.76 ** f;
        it.vy = (it.vy + (ty - it.oy) * 0.14 * f) * 0.76 ** f;
        it.vr = (it.vr + (tr - it.or) * 0.14 * f) * 0.76 ** f;
        it.ox += it.vx * f;
        it.oy += it.vy * f;
        it.or += it.vr * f;
        if (Math.abs(it.vx) + Math.abs(it.vy) + Math.abs(it.vr) * 60 > 0.03 || Math.abs(tx - it.ox) + Math.abs(ty - it.oy) > 0.1) moving = true;
        if (Math.abs(it.ox) + Math.abs(it.oy) > 0.1) anyDisplaced = true;
      };
      items.forEach(springs);
      stamps.forEach(springs);
      return moving;
    };

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      let active = physics(dt);
      for (const [k, it] of items) {
        if (it.dieAt !== null) {
          if (now - it.dieAt >= FADE_MS) items.delete(k);
          else active = true;
        } else if (now < it.start + it.dur) active = true;
      }
      stamps = stamps.filter((it) => it.dieAt === null || now - it.dieAt < FADE_MS);
      for (const it of stamps) if (it.dieAt !== null || now < it.start + it.dur) active = true;
      trails = trails.filter((t) => t.releasedAt === null || now - t.releasedAt < TRAIL_HOLD_MS + TRAIL_FADE_MS);
      if (trails.length) active = true;
      draw(now);
      if (active) frame = requestAnimationFrame(tick);
      else running = false;
    };

    const wake = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const nearAny = () => {
      const x = px();
      const y = py();
      const test = (it: Live) => Math.hypot(it.x - x, it.y - y) < REACH + it.shape.radius * 0.5;
      for (const it of items.values()) if (test(it)) return true;
      return stamps.some(test);
    };

    /* ---------- doodling on empty paper ---------- */

    const endDoodle = () => {
      root.classList.remove("is-doodling");
      if (down?.trail) down.trail.releasedAt = performance.now();
      down = null;
      wake();
    };

    const stamp = (x: number, y: number) => {
      const r = rng((Math.random() * 2 ** 32) >>> 0);
      const s = randomScribble(`stamp:${stampCount++}`, x, y, 52 + r() * 30, r, "full");
      stamps.push(live(s, performance.now(), reduced() ? 0 : STAMP_MS));
      const alive = stamps.filter((it) => it.dieAt === null);
      if (alive.length > MAX_STAMPS) alive[0].dieAt = performance.now();
      play("scribble");
      wake();
    };

    const onDown = (e: PointerEvent) => {
      if (getScribbleMode().mode !== "full" || e.button !== 0) return;
      const t = e.target;
      if (!(t instanceof Element) || !t.hasAttribute("data-paper")) return;
      down = { id: e.pointerId, type: e.pointerType, x: e.clientX, y: e.clientY, trail: null };
      if (e.pointerType !== "touch") {
        root.classList.add("is-doodling");
        window.getSelection()?.removeAllRanges();
      }
    };

    const onMove = (e: PointerEvent) => {
      cx = e.clientX;
      cy = e.clientY;
      inside = true;
      if (down && e.pointerId === down.id) {
        const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > TAP_SLOP;
        if (moved && down.type === "touch") {
          // A finger drag is a scroll, never a doodle.
          down = null;
        } else if (moved || down.trail) {
          if (!down.trail) {
            down.trail = { pts: [[down.x + window.scrollX, down.y + window.scrollY]], color: currentAccent(), releasedAt: null };
            trails.push(down.trail);
            if (trails.length > MAX_TRAILS) trails = trails.slice(-MAX_TRAILS);
          }
          down.trail.pts.push([px(), py()]);
          wake();
          return;
        }
      }
      if (!reduced() && (running || anyDisplaced || nearAny())) wake();
    };

    const onUp = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      if (!down.trail) stamp(e.clientX + window.scrollX, e.clientY + window.scrollY);
      endDoodle();
    };

    const onCancel = (e: PointerEvent) => {
      if (down && e.pointerId === down.id) endDoodle();
    };

    const onLeave = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      inside = false;
      if (anyDisplaced) wake();
    };

    /* ---------- page changes ---------- */

    let rebuildTimer = 0;
    let started = false;
    const scheduleRebuild = (delay = 150) => {
      if (!started) return;
      window.clearTimeout(rebuildTimer);
      rebuildTimer = window.setTimeout(() => requestAnimationFrame(rebuild), delay);
    };

    const onResize = () => {
      sizeCanvas();
      draw(performance.now());
      scheduleRebuild();
    };

    const onScroll = () => wake();

    const offMode = onScribbleMode(() => {
      // A new screen: old doodles and stamps fade out, the new page's scribbles draw in.
      const now = performance.now();
      for (const it of stamps) if (it.dieAt === null) it.dieAt = now;
      for (const t of trails) if (t.releasedAt === null) t.releasedAt = now - TRAIL_HOLD_MS - TRAIL_FADE_MS + FADE_MS;
      scheduleRebuild(0);
    });

    setStampHandler((x, y) => {
      if (getScribbleMode().mode !== "full") return false;
      stamp(x, y);
      return true;
    });

    const bodyObserver = new ResizeObserver(() => scheduleRebuild());
    bodyObserver.observe(document.body);
    // Content can move without the page changing size (a player joins the lobby), so watch the DOM too.
    // During a turn the timer and chat change constantly; the faint calm scribbles don't need to follow them.
    const domObserver = new MutationObserver(() => {
      if (getScribbleMode().mode === "full") scheduleRebuild(250);
    });
    domObserver.observe(document.getElementById("root") ?? document.body, { childList: true, subtree: true, characterData: true });

    sizeCanvas();
    // Wait for fonts so the first layout (and its one draw-in) is the final one.
    const begin = () => {
      if (started) return;
      started = true;
      requestAnimationFrame(rebuild);
    };
    void document.fonts?.ready.then(begin);
    const fontTimeout = window.setTimeout(begin, 700);

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    document.documentElement.addEventListener("pointerout", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(rebuildTimer);
      window.clearTimeout(fontTimeout);
      offMode();
      setStampHandler(null);
      bodyObserver.disconnect();
      domObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      document.documentElement.removeEventListener("pointerout", onLeave);
      root.classList.remove("is-doodling");
    };
  }, []);

  return <canvas ref={ref} className="scribble-field" aria-hidden="true" />;
}
