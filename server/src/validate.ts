import { z } from "zod";
import { AVATAR_COLORS, BRUSH_SIZES, CANVAS, LIMITS, PALETTE } from "../../shared/constants.js";

const id = z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const paletteColor = z.enum(PALETTE as unknown as [string, ...string[]]);
const code = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{5}$/, "Room codes are 5 letters, like KQWPT.");

/** Flat [x, y, x, y, ...] list clamped to the canvas. */
const points = (max: number) =>
  z
    .array(z.number().finite())
    .max(max)
    .refine((p) => p.length % 2 === 0, "points must be pairs")
    .transform((p) => p.map((v, i) => Math.round(Math.max(0, Math.min(i % 2 === 0 ? CANVAS.width : CANVAS.height, v)))));

export const strokeSchema = z.object({
  kind: z.literal("stroke"),
  id,
  color: hexColor,
  size: z.number().refine((s) => (BRUSH_SIZES as readonly number[]).includes(s)),
  tool: z.enum(["pen", "eraser"]),
  points: points(LIMITS.pointsPerTurn).refine((p) => p.length >= 2, "a stroke needs a point"),
});

export const fillSchema = z.object({
  kind: z.literal("fill"),
  id,
  x: z.number().int().min(0).max(CANVAS.width - 1),
  y: z.number().int().min(0).max(CANVAS.height - 1),
  color: paletteColor,
});

export const clearSchema = z.object({ kind: z.literal("clear"), id });

export const actionSchema = z.discriminatedUnion("kind", [strokeSchema, fillSchema, clearSchema]);

const settingsSchema = z
  .object({
    rounds: z.number().int(),
    drawTime: z.number().int(),
    wordChoices: z.number().int(),
    maxPlayers: z.number().int(),
    language: z.enum(["en", "id"]),
    categories: z.array(z.string().max(32)).max(40),
    customWords: z.array(z.string().max(64)).max(LIMITS.customWordsMax * 2),
    customOnly: z.boolean(),
    mode: z.enum(["classic", "speed"]),
  })
  .partial()
  .strict();

const name = z.string().max(60);
const color = z.enum(AVATAR_COLORS as unknown as [string, ...string[]]);

export const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create"), name, color }),
  z.object({ action: z.literal("join"), code, name, color }),
  z.object({ action: z.literal("sync"), code }),
  z.object({ action: z.literal("leave"), code }),
  z.object({ action: z.literal("settings"), code, settings: settingsSchema }),
  z.object({ action: z.literal("start"), code }),
  z.object({ action: z.literal("again"), code }),
  z.object({ action: z.literal("choose"), code, index: z.number().int().min(0).max(8) }),
  z.object({ action: z.literal("chat"), code, text: z.string().max(LIMITS.chatMax * 2) }),
  z.object({ action: z.literal("react"), code, kind: z.enum(["like", "dislike"]) }),
  z.object({ action: z.literal("drawing"), code }),
  z.object({
    action: z.literal("drawSync"),
    code,
    turnId: z.number().int().min(1),
    keep: z.number().int().min(0).max(LIMITS.actionsPerTurn),
    append: z.array(actionSchema).max(LIMITS.actionsPerTurn),
  }),
  z.object({ action: z.literal("gallery"), code }),
]);

export type ValidRequest = z.infer<typeof requestSchema>;
