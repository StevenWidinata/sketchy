import { z } from "zod";
import { AVATAR_COLORS, BRUSH_SIZES, CANVAS, LIMITS, PALETTE } from "../../shared/constants";

const id = z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const paletteColor = z.enum(PALETTE as unknown as [string, ...string[]]);
const coord = z.number().finite();

/** Flat [x, y, x, y, ...] list clamped to the canvas. */
const points = z
  .array(coord)
  .max(LIMITS.pointsPerMessage)
  .refine((p) => p.length % 2 === 0, "points must be pairs")
  .transform((p) =>
    p.map((v, i) => Math.round(Math.max(0, Math.min(i % 2 === 0 ? CANVAS.width : CANVAS.height, v)))),
  );

export const joinSchema = z.object({
  code: z.string().trim().toUpperCase().length(LIMITS.roomCodeLength).regex(/^[A-Z]+$/).optional(),
  name: z.string().max(60),
  color: z.enum(AVATAR_COLORS as unknown as [string, ...string[]]),
  sessionId: z.string().uuid(),
});

export const settingsSchema = z
  .object({
    rounds: z.number().int(),
    drawTime: z.number().int(),
    wordChoices: z.number().int(),
    maxPlayers: z.number().int(),
    language: z.enum(["en", "id"]),
    categories: z.array(z.string().max(32)).max(40),
    customWords: z.array(z.string().max(64)).max(LIMITS.customWordsMax * 2),
    customOnly: z.boolean(),
  })
  .partial()
  .strict();

export const strokeSchema = z.object({
  kind: z.literal("stroke"),
  id,
  color: hexColor,
  size: z.number().refine((s) => (BRUSH_SIZES as readonly number[]).includes(s)),
  tool: z.enum(["pen", "eraser"]),
  points: points.refine((p) => p.length >= 2, "a stroke needs a point"),
});

export const pointsSchema = z.object({ id, points });

export const fillSchema = z.object({
  kind: z.literal("fill"),
  id,
  x: z.number().int().min(0).max(CANVAS.width - 1),
  y: z.number().int().min(0).max(CANVAS.height - 1),
  color: paletteColor,
});

export const clearSchema = z.object({ kind: z.literal("clear"), id });

export const chatSchema = z.string().max(LIMITS.chatMax * 2);
export const chooseSchema = z.number().int().min(0).max(8);
export const reactSchema = z.enum(["like", "dislike"]);
