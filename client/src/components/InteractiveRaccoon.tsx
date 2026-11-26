import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { stampScribble } from "../lib/scribbles";
import { play } from "../lib/sound";
import { Raccoon, type RaccoonMood } from "./Raccoon";

type TapReaction = "giggle" | "trick" | "doodle";
const TAP_REACTIONS: TapReaction[] = ["giggle", "trick", "doodle"];
const LENGTH: Record<TapReaction, number> = { giggle: 900, trick: 1000, doodle: 1200 };

/** Taps this close together make it dizzy, then grumpy. */
const POKES = 5;
const POKE_WINDOW = 2500;
const DIZZY_MS = 1100;
const GRUMPY_MS = 2000;

const GRAVITY = 2400;
const BOUNCE = 0.62;
const HOLD_MS = 250;
const MOUSE_SLOP = 6;
const TOUCH_SLOP = 8;

interface Props {
  /** The mood the screen wants; reactions play over it for a moment. */
  mood?: RaccoonMood;
  /** Eyes and head follow the pointer. */
  follow?: boolean;
  /** A width in px, or omit to fill the parent. */
  size?: number;
  className?: string;
  /** Not pressable right now, for example while it sits over the canvas you're drawing on. */
  disabled?: boolean;
}

interface Pos {
  x: number;
  y: number;
  rot: number;
}

/**
 * The mascot as a toy. Tap it for a reaction (never the same twice in a row), poke it fast and it gets grumpy,
 * pick it up (drag with a mouse, or press and hold a finger) and throw it: it bounces off the screen edges,
 * lands dizzy and walks back to its spot.
 */
export function InteractiveRaccoon({ mood = "idle", follow, size, className = "", disabled }: Props) {
  const btn = useRef<HTMLButtonElement>(null);
  const flyer = useRef<HTMLDivElement>(null);
  const [reaction, setReaction] = useState<RaccoonMood | null>(null);
  const [flying, setFlying] = useState<{ w: number; h: number; mood: RaccoonMood } | null>(null);
  const pos = useRef<Pos>({ x: 0, y: 0, rot: 0 });
  // Read by the animation loops, which outlive the render that started them.
  const dims = useRef({ w: 0, h: 0 });
  const taps = useRef<number[]>([]);
  const lastTap = useRef<TapReaction | null>(null);
  const grumpy = useRef(false);
  const timers = useRef<number[]>([]);
  const frame = useRef(0);
  const dragged = useRef(false);
  const cleanupDrag = useRef<(() => void) | null>(null);

  const later = (fn: () => void, ms: number) => void timers.current.push(window.setTimeout(fn, ms));
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(
    () => () => {
      clearTimers();
      cancelAnimationFrame(frame.current);
      cleanupDrag.current?.();
    },
    [],
  );

  const place = () => {
    const el = flyer.current;
    if (!el) return;
    const { x, y, rot } = pos.current;
    const { w, h } = dims.current;
    el.style.transform = `translate3d(${x - w / 2}px, ${y - h / 2}px, 0) rotate(${rot}deg)`;
  };
  useLayoutEffect(place);

  /* ---------- taps ---------- */

  const poke = () => {
    if (disabled || grumpy.current || flying) return;
    const now = performance.now();
    taps.current = [...taps.current.filter((t) => now - t < POKE_WINDOW), now];
    clearTimers();

    if (taps.current.length >= POKES) {
      taps.current = [];
      grumpy.current = true;
      setReaction("dizzy");
      play("squeak");
      later(() => {
        setReaction("grumpy");
        play("grumble");
      }, DIZZY_MS);
      later(() => {
        setReaction(null);
        grumpy.current = false;
      }, DIZZY_MS + GRUMPY_MS);
      return;
    }

    const options = TAP_REACTIONS.filter((r) => r !== lastTap.current);
    const r = options[Math.floor(Math.random() * options.length)];
    lastTap.current = r;
    setReaction(r);
    if (r === "giggle") play("giggle");
    if (r === "trick") play("boing");
    if (r === "doodle") {
      // A real scribble lands on the paper beside it; during a turn it only scribbles in the air.
      const rect = btn.current!.getBoundingClientRect();
      const right = rect.right + 80 < window.innerWidth;
      const x = (right ? rect.right + 44 : rect.left - 44) + window.scrollX;
      const y = rect.top + rect.height * 0.55 + window.scrollY;
      later(() => {
        if (!stampScribble(x, y)) play("scribble");
      }, 380);
    }
    later(() => setReaction(null), LENGTH[r]);
  };

  /* ---------- pick up and throw ---------- */

  const walkHome = () => {
    const home = btn.current?.getBoundingClientRect();
    if (!home) return setFlying(null);
    const from = { ...pos.current };
    const to = { x: home.left + home.width / 2, y: home.top + home.height / 2 };
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const duration = Math.max(450, Math.min(1300, dist * 1.4));
    setFlying((f) => f && { ...f, mood: "walk" });
    const start = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      pos.current = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, rot: 0 };
      place();
      if (k < 1) frame.current = requestAnimationFrame(step);
      else setFlying(null);
    };
    frame.current = requestAnimationFrame(step);
  };

  const land = () => {
    pos.current.rot = 0;
    place();
    setFlying((f) => f && { ...f, mood: "dizzy" });
    later(walkHome, 900);
  };

  const fling = (vx: number, vy: number, w: number, h: number) => {
    if (Math.hypot(vx, vy) > 500) play("whoosh");
    let last = performance.now();
    const began = last;
    const step = (t: number) => {
      const dt = Math.min(0.032, (t - last) / 1000);
      last = t;
      const p = pos.current;
      vy += GRAVITY * dt;
      p.x += vx * dt;
      p.y += vy * dt;
      const maxX = window.innerWidth - w / 2;
      const maxY = window.innerHeight - h / 2;
      let impact = 0;
      if (p.x < w / 2 || p.x > maxX) {
        p.x = Math.max(w / 2, Math.min(maxX, p.x));
        impact = Math.abs(vx);
        vx = -vx * BOUNCE;
      }
      if (p.y < h / 2) {
        p.y = h / 2;
        impact = Math.max(impact, Math.abs(vy));
        vy = -vy * BOUNCE;
      }
      const onFloor = p.y >= maxY;
      if (onFloor) {
        p.y = maxY;
        impact = Math.max(impact, Math.abs(vy));
        vy = Math.abs(vy) > 160 ? -vy * BOUNCE : 0;
        vx *= Math.pow(0.08, dt);
      }
      if (impact > 380) play("pop");
      // Tumbles in the air, settles upright on the floor.
      p.rot = onFloor && vy === 0 ? p.rot * 0.8 : p.rot + vx * dt * 0.5;
      place();
      const resting = onFloor && vy === 0 && Math.abs(vx) < 40;
      if (resting || t - began > 4500) land();
      else frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled || flying || e.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = btn.current!;
    const rect = el.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const grab = { x: e.clientX - (rect.left + w / 2), y: e.clientY - (rect.top + h / 2) };
    const id = e.pointerId;
    const touch = e.pointerType === "touch";
    const start = { x: e.clientX, y: e.clientY };
    const samples: { x: number; y: number; t: number }[] = [];
    let held = false;
    let holdTimer = 0;
    dragged.current = false;

    const pickUp = (x: number, y: number) => {
      held = true;
      dragged.current = true;
      clearTimers();
      grumpy.current = false;
      setReaction(null);
      pos.current = { x: x - grab.x, y: y - grab.y, rot: 0 };
      dims.current = { w, h };
      setFlying({ w, h, mood: "held" });
      play("squeak");
      navigator.vibrate?.(12);
    };

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      const moved = Math.hypot(ev.clientX - start.x, ev.clientY - start.y);
      if (!held) {
        if (touch) {
          // A finger that moves before the hold is a scroll, not a pickup.
          if (moved > TOUCH_SLOP) stop();
          return;
        }
        if (moved <= MOUSE_SLOP) return;
        pickUp(ev.clientX, ev.clientY);
      }
      const now = performance.now();
      samples.push({ x: ev.clientX, y: ev.clientY, t: now });
      while (samples.length > 6) samples.shift();
      const prev = samples[0];
      const vx = prev ? ((ev.clientX - prev.x) / Math.max(1, now - prev.t)) * 1000 : 0;
      pos.current = { x: ev.clientX - grab.x, y: ev.clientY - grab.y, rot: Math.max(-28, Math.min(28, vx * 0.02)) };
      place();
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      const wasHeld = held;
      stop();
      if (!wasHeld) return;
      const now = performance.now();
      const first = samples.find((s) => now - s.t < 120) ?? samples[samples.length - 1];
      const dt = first ? Math.max(16, now - first.t) / 1000 : 1;
      const vx = first ? (ev.clientX - first.x) / dt : 0;
      const vy = first ? (ev.clientY - first.y) / dt : 0;
      setFlying((f) => f && { ...f, mood: "trick" });
      fling(Math.max(-3200, Math.min(3200, vx)), Math.max(-3200, Math.min(3200, vy)), w, h);
    };

    const onCancel = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      const wasHeld = held;
      stop();
      if (wasHeld) fling(0, 0, w, h);
    };

    // Once it's in your hand, a finger drag moves the raccoon instead of scrolling the page.
    const onTouchMove = (ev: TouchEvent) => {
      if (held) ev.preventDefault();
    };

    const stop = () => {
      window.clearTimeout(holdTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("touchmove", onTouchMove);
      cleanupDrag.current = null;
    };

    if (touch) holdTimer = window.setTimeout(() => pickUp(start.x, start.y), HOLD_MS);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    cleanupDrag.current = stop;
  };

  const onClick = () => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    poke();
  };

  return (
    <>
      <button
        ref={btn}
        type="button"
        className={`rc-btn${flying ? " is-away" : ""}${disabled ? " is-off" : ""} ${className}`}
        style={size ? { width: size } : undefined}
        aria-label="Poke the raccoon"
        aria-hidden={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        onPointerDown={onPointerDown}
        onClick={onClick}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Raccoon mood={reaction ?? mood} follow={follow} size="100%" />
      </button>
      {flying &&
        createPortal(
          <div ref={flyer} className="rc-flyer" style={{ width: flying.w, height: flying.h }} aria-hidden="true">
            <Raccoon mood={flying.mood} size="100%" />
          </div>,
          document.body,
        )}
    </>
  );
}
