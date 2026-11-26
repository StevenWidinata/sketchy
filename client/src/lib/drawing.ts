import { CANVAS } from "../../../shared/constants";
import type { DrawAction } from "../../../shared/types";

export const CANVAS_BG = "#ffffff";

type Stroke = Extract<DrawAction, { kind: "stroke" }>;

export function clearCanvas(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = CANVAS_BG;
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  ctx.restore();
}

/** Draw a stroke from point-pair index `from` (0 = whole stroke). Smoothed with midpoint quadratics. */
export function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke, from = 0, to = s.points.length / 2) {
  const p = s.points;
  const n = Math.min(to, p.length / 2);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = s.size;
  const color = s.tool === "eraser" ? CANVAS_BG : s.color;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  if (n === 1 && from === 0) {
    ctx.beginPath();
    ctx.arc(p[0], p[1], s.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  ctx.beginPath();
  for (let i = Math.max(1, from); i < n; i++) {
    const x0 = p[(i - 1) * 2];
    const y0 = p[(i - 1) * 2 + 1];
    const x1 = p[i * 2];
    const y1 = p[i * 2 + 1];
    if (i === 1) ctx.moveTo(x0, y0);
    else ctx.moveTo((p[(i - 2) * 2] + x0) / 2, (p[(i - 2) * 2 + 1] + y0) / 2);
    ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
    ctx.lineTo(x1, y1);
  }
  ctx.stroke();
  ctx.restore();
}

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/** Scanline flood fill with a tolerance, so anti-aliased edges don't leave halos. */
export function floodFill(ctx: CanvasRenderingContext2D, sx: number, sy: number, hex: string) {
  const { width: w, height: h } = CANVAS;
  const x0 = Math.floor(sx);
  const y0 = Math.floor(sy);
  if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h) return;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const start = (y0 * w + x0) * 4;
  const tr = d[start];
  const tg = d[start + 1];
  const tb = d[start + 2];
  const [fr, fg, fb] = hexToRgb(hex);
  if (Math.abs(tr - fr) + Math.abs(tg - fg) + Math.abs(tb - fb) < 6) return;
  const tol = 96;
  const matches = (i: number) => Math.abs(d[i] - tr) + Math.abs(d[i + 1] - tg) + Math.abs(d[i + 2] - tb) <= tol;
  const seen = new Uint8Array(w * h);
  const stack: number[] = [x0, y0];
  while (stack.length) {
    const y = stack.pop()!;
    let x = stack.pop()!;
    let idx = y * w + x;
    while (x >= 0 && !seen[idx] && matches(idx * 4)) {
      x--;
      idx--;
    }
    x++;
    idx++;
    let up = false;
    let down = false;
    while (x < w && !seen[idx] && matches(idx * 4)) {
      const i = idx * 4;
      d[i] = fr;
      d[i + 1] = fg;
      d[i + 2] = fb;
      d[i + 3] = 255;
      seen[idx] = 1;
      if (y > 0) {
        const ui = idx - w;
        const ok = !seen[ui] && matches(ui * 4);
        if (ok && !up) stack.push(x, y - 1);
        up = ok;
      }
      if (y < h - 1) {
        const di = idx + w;
        const ok = !seen[di] && matches(di * 4);
        if (ok && !down) stack.push(x, y + 1);
        down = ok;
      }
      x++;
      idx++;
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function applyAction(ctx: CanvasRenderingContext2D, a: DrawAction) {
  if (a.kind === "stroke") drawStroke(ctx, a);
  else if (a.kind === "fill") floodFill(ctx, a.x, a.y, a.color);
  else clearCanvas(ctx);
}

export function renderAll(ctx: CanvasRenderingContext2D, actions: DrawAction[]) {
  clearCanvas(ctx);
  for (const a of actions) applyAction(ctx, a);
}

/** Total "work units" for a timelapse: one per stroke point pair, a few per fill or clear. */
export function timelineLength(actions: DrawAction[]): number {
  return actions.reduce((sum, a) => sum + (a.kind === "stroke" ? a.points.length / 2 : 8), 0);
}

/** Render the drawing as it looked after `units` of work. */
export function renderUpTo(ctx: CanvasRenderingContext2D, actions: DrawAction[], units: number) {
  clearCanvas(ctx);
  let left = units;
  for (const a of actions) {
    if (left <= 0) break;
    if (a.kind === "stroke") {
      const pairs = a.points.length / 2;
      drawStroke(ctx, a, 0, Math.min(pairs, Math.ceil(left)));
      left -= pairs;
    } else {
      applyAction(ctx, a);
      left -= 8;
    }
  }
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
