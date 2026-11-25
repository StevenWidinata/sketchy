import { useEffect, useRef, useState } from "react";
import { Doodle, type DoodleName } from "./Doodle";
import { Icon } from "./Icon";

interface Card {
  doodle: DoodleName;
  category: string;
  wrong: { who: string; color: string; text: string };
  right: { who: string; color: string; text: string };
}

const CARDS: Card[] = [
  { doodle: "giraffe", category: "Animals", wrong: { who: "Rina", color: "#ff8a3d", text: "a horse?" }, right: { who: "Bayu", color: "#3fa9f5", text: "giraffe" } },
  { doodle: "rocket", category: "Space", wrong: { who: "Mei", color: "#f472b6", text: "pencil" }, right: { who: "Tomi", color: "#d4ff3f", text: "rocket" } },
  { doodle: "pizza", category: "Food", wrong: { who: "Ade", color: "#ffd23f", text: "cheese" }, right: { who: "Lia", color: "#8b5cf6", text: "pizza" } },
  { doodle: "house", category: "Places & buildings", wrong: { who: "Joss", color: "#3fbf5f", text: "barn" }, right: { who: "Nadia", color: "#ff8a3d", text: "house" } },
  { doodle: "octopus", category: "Ocean life", wrong: { who: "Kevin", color: "#3fa9f5", text: "jellyfish" }, right: { who: "Putri", color: "#f472b6", text: "octopus" } },
  { doodle: "guitar", category: "Music & instruments", wrong: { who: "Sam", color: "#e5372f", text: "violin" }, right: { who: "Rina", color: "#ff8a3d", text: "guitar" } },
  { doodle: "umbrella", category: "Household objects", wrong: { who: "Dewi", color: "#d4ff3f", text: "mushroom" }, right: { who: "Ari", color: "#3fbf5f", text: "umbrella" } },
  { doodle: "kite", category: "Toys & games", wrong: { who: "Bima", color: "#8b5cf6", text: "diamond" }, right: { who: "Mei", color: "#f472b6", text: "kite" } },
];

const PITCH = 236;
const SPEED = 38; // px per second

/** A curved row of paper cards that drifts left, can be dragged and flung, and pauses on request. */
export function Carousel() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [paused, setPaused] = useState(false);
  const [reduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const pausedRef = useRef(paused);
  pausedRef.current = paused || reduced;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const n = CARDS.length * 2;
    const total = n * PITCH;
    let offset = 0;
    let velocity = 0;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let prevTime = performance.now();
    let frame = 0;
    let width = stage.clientWidth;
    const lastSlot: number[] = new Array(n).fill(0);

    const onResize = () => {
      width = stage.clientWidth;
    };
    window.addEventListener("resize", onResize);

    const layout = () => {
      const half = width / 2;
      const scale = Math.min(1, Math.max(0.72, width / 1200));
      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const raw = i * PITCH - offset;
        const slot = Math.floor((raw + total / 2) / total);
        let x = (((raw + total / 2) % total) + total) % total - total / 2;
        x *= scale;
        const d = Math.min(1.2, Math.abs(x) / (half + 60));
        const sign = x < 0 ? -1 : 1;
        const rot = sign * d * 26;
        const lift = d * d * 26;
        const grow = 1 + d * d * 0.16;
        el.style.transform = `translate3d(${x}px, ${lift}px, 0) rotateY(${-rot}deg) scale(${grow * scale})`;
        el.style.zIndex = String(100 - Math.round(d * 50));
        // Redraw a card's doodle when it wraps around to the right edge.
        if (slot !== lastSlot[i]) {
          lastSlot[i] = slot;
          const svg = el.querySelector(".doodle");
          if (svg && x > 0) {
            svg.classList.remove("is-drawn");
            void (svg as SVGElement).getBoundingClientRect();
            svg.classList.add("is-drawn");
          }
        }
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prevTime) / 1000);
      prevTime = now;
      if (!dragging) {
        if (Math.abs(velocity) > 2) {
          offset += velocity * dt;
          velocity *= Math.pow(0.05, dt);
        } else if (!pausedRef.current) {
          offset += SPEED * dt;
        }
      }
      layout();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      velocity = 0;
      lastX = e.clientX;
      lastT = performance.now();
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("is-dragging");
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      offset -= dx;
      velocity = (-dx / Math.max(1, now - lastT)) * 1000;
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = () => {
      dragging = false;
      stage.classList.remove("is-dragging");
    };
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const cards = [...CARDS, ...CARDS];

  return (
    <div className="carousel">
      <div className="carousel-stage" ref={stageRef}>
        <ul className="carousel-track" aria-label="Example rounds">
          {cards.map((c, i) => (
            <li key={i} className="doodle-card" ref={(el) => void (cardRefs.current[i] = el)} aria-hidden={i >= CARDS.length}>
              <span className="doodle-card-cat">{c.category}</span>
              <Doodle name={c.doodle} delay={600 + (i % CARDS.length) * 140} />
              <div className="doodle-card-chat">
                <p className="guess guess-wrong">
                  <span className="guess-dot" style={{ background: c.wrong.color }} />
                  <span className="guess-name">{c.wrong.who}</span>
                  <s>{c.wrong.text}</s>
                </p>
                <p className="guess guess-right">
                  <span className="guess-dot" style={{ background: c.right.color }} />
                  <span className="guess-name">{c.right.who}</span>
                  <span className="swipe">{c.right.text}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {!reduced && (
        <button
          type="button"
          className="icon-btn carousel-pause"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play card animation" : "Pause card animation"}
          aria-pressed={paused}
        >
          <Icon name={paused ? "play" : "pause"} size={16} />
        </button>
      )}
    </div>
  );
}
