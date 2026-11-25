import { useEffect, useRef, useState } from "react";
import { BRUSH_SIZES, CANVAS, PALETTE } from "../../../../shared/constants";
import type { DrawAction, Tool } from "../../../../shared/types";
import { applyAction, drawStroke, newId, renderAll } from "../../lib/drawing";
import { draw } from "../../lib/net";
import { drawing } from "../../lib/store";
import { Icon } from "../Icon";

type BoardTool = Tool | "fill";

const COLOR_NAMES: Record<string, string> = {
  "#16171c": "Black", "#ffffff": "White", "#8a8d96": "Gray", "#c9c6bd": "Light gray",
  "#e5372f": "Red", "#ff8a3d": "Orange", "#ffd23f": "Yellow", "#d4ff3f": "Lime",
  "#3fbf5f": "Green", "#1f8a70": "Teal", "#3fa9f5": "Sky blue", "#2347d8": "Blue",
  "#8b5cf6": "Purple", "#f472b6": "Pink", "#8b5a2b": "Brown", "#f2c9a0": "Skin",
};
const SIZE_NAMES = ["Small", "Medium", "Large", "Huge"];

export function Board({ canDraw, label }: { canDraw: boolean; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<BoardTool>("pen");
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [size, setSize] = useState<number>(BRUSH_SIZES[1]);
  const settings = useRef({ tool, color, size });
  settings.current = { tool, color, size };

  // Render the shared drawing log and keep it in sync.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    renderAll(ctx, drawing.actions);
    return drawing.subscribe((e) => {
      if (e.type === "reset") renderAll(ctx, drawing.actions);
      else if (e.type === "action") applyAction(ctx, e.action);
      else {
        const s = drawing.actions.findLast((a) => a.kind === "stroke" && a.id === e.id);
        if (s?.kind === "stroke") drawStroke(ctx, s, Math.max(1, e.from));
      }
    });
  }, []);

  // Pointer drawing for the drawer.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canDraw) return;
    let active: Extract<DrawAction, { kind: "stroke" }> | null = null;
    let lastX = 0;
    let lastY = 0;
    let rect = canvas.getBoundingClientRect();

    const toCanvas = (e: PointerEvent) => [
      Math.round(((e.clientX - rect.left) / rect.width) * CANVAS.width),
      Math.round(((e.clientY - rect.top) / rect.height) * CANVAS.height),
    ];


    const down = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      rect = canvas.getBoundingClientRect();
      const [x, y] = toCanvas(e);
      const { tool: t, color: c, size: s } = settings.current;
      if (t === "fill") {
        const action = { kind: "fill" as const, id: newId(), x: Math.min(CANVAS.width - 1, x), y: Math.min(CANVAS.height - 1, y), color: c };
        draw.fill(action);
        return;
      }
      canvas.setPointerCapture(e.pointerId);
      active = { kind: "stroke", id: newId(), color: c, size: s, tool: t, points: [x, y] };
      lastX = x;
      lastY = y;
      draw.begin(active);
    };

    const move = (e: PointerEvent) => {
      moveCursor(e);
      if (!active) return;
      const events = e.getCoalescedEvents?.() ?? [e];
      const added: number[] = [];
      for (const ev of events.length ? events : [e]) {
        const [x, y] = toCanvas(ev);
        if (Math.hypot(x - lastX, y - lastY) < 2) continue;
        added.push(x, y);
        lastX = x;
        lastY = y;
      }
      if (!added.length) return;
      draw.points(active.id, added);
    };

    const up = () => {
      draw.flush();
      active = null;
    };

    const moveCursor = (e: PointerEvent) => {
      const el = cursorRef.current;
      if (!el || e.pointerType === "touch") return;
      const r = canvas.getBoundingClientRect();
      const scale = r.width / CANVAS.width;
      const d = settings.current.tool === "fill" ? 18 : Math.max(6, settings.current.size * scale);
      el.style.width = el.style.height = `${d}px`;
      el.style.transform = `translate(${e.clientX - r.left - d / 2}px, ${e.clientY - r.top - d / 2}px)`;
      el.style.opacity = "1";
    };
    const hideCursor = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", hideCursor);
    return () => {
      draw.flush();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("pointerleave", hideCursor);
    };
  }, [canDraw]);

  const undo = () => draw.undo();

  const clear = () => draw.clear({ kind: "clear", id: newId() });

  // Keyboard shortcuts for the drawer.
  useEffect(() => {
    if (!canDraw) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "b" || k === "p") setTool("pen");
      else if (k === "e") setTool("eraser");
      else if (k === "f" || k === "g") setTool("fill");
      else if (k === "[" || k === "]") {
        const i = BRUSH_SIZES.indexOf(settings.current.size as (typeof BRUSH_SIZES)[number]);
        const next = Math.max(0, Math.min(BRUSH_SIZES.length - 1, i + (k === "]" ? 1 : -1)));
        setSize(BRUSH_SIZES[next]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canDraw]);

  return (
    <div className={`board${canDraw ? " can-draw" : ""}`}>
      <div className="paper">
        <canvas
          ref={canvasRef}
          width={CANVAS.width}
          height={CANVAS.height}
          className={`canvas tool-${tool}`}
          role="img"
          aria-label={label}
        />
        {canDraw && <div ref={cursorRef} className={`brush-cursor${tool === "eraser" ? " is-eraser" : ""}`} aria-hidden="true" />}
      </div>

      {canDraw && (
        <div className="toolbar" role="toolbar" aria-label="Drawing tools">
          <div className="tool-group" role="radiogroup" aria-label="Tool">
            {(
              [
                ["pen", "pencil", "Pen (B)"],
                ["eraser", "eraser", "Eraser (E)"],
                ["fill", "bucket", "Fill (F)"],
              ] as const
            ).map(([t, icon, name]) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={tool === t}
                aria-label={name}
                title={name}
                className={`tool-btn${tool === t ? " is-on" : ""}`}
                onClick={() => setTool(t)}
              >
                <Icon name={icon} size={20} />
              </button>
            ))}
          </div>

          <div className="tool-group sizes" role="radiogroup" aria-label="Brush size">
            {BRUSH_SIZES.map((s, i) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={size === s}
                aria-label={`${SIZE_NAMES[i]} brush`}
                title={`${SIZE_NAMES[i]} brush`}
                className={`tool-btn size-btn${size === s ? " is-on" : ""}`}
                onClick={() => {
                  setSize(s);
                  if (tool === "fill") setTool("pen");
                }}
              >
                <span className="size-dot" style={{ width: 4 + i * 5, height: 4 + i * 5 }} />
              </button>
            ))}
          </div>

          <div className="palette" role="radiogroup" aria-label="Color">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c}
                aria-label={COLOR_NAMES[c] ?? c}
                title={COLOR_NAMES[c]}
                className={`color-btn${color === c ? " is-on" : ""}`}
                style={{ ["--c" as string]: c }}
                onClick={() => {
                  setColor(c);
                  if (tool === "eraser") setTool("pen");
                }}
              />
            ))}
          </div>

          <div className="tool-group">
            <button type="button" className="tool-btn" onClick={undo} aria-label="Undo (Ctrl+Z)" title="Undo (Ctrl+Z)">
              <Icon name="undo" size={20} />
            </button>
            <button type="button" className="tool-btn" onClick={clear} aria-label="Clear canvas (you can undo this)" title="Clear canvas">
              <Icon name="trash" size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
