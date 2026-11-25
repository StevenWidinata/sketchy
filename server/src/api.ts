import { randomInt } from "node:crypto";
import type postgres from "postgres";
import { LIMITS } from "../../shared/constants.js";
import type { ApiResponse, DrawAction, GalleryItem, RoomState } from "../../shared/types.js";
import { db } from "./db.js";
import { Game, newRoom, type Effect, type RoomData } from "./game/engine.js";
import { RateLimiter } from "./rateLimit.js";
import { broadcast, verifyUser, type Broadcast } from "./supabase.js";
import { requestSchema, type ValidRequest } from "./validate.js";

const MAX_BODY = 1_500_000;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";

// Best-effort limits per server instance. Fluid Compute reuses instances, so these catch bursts.
const limiters = new Map<string, RateLimiter>();
function limiterFor(user: string): RateLimiter {
  let l = limiters.get(user);
  if (!l) {
    if (limiters.size > 5000) limiters.clear();
    l = new RateLimiter({
      any: { capacity: 30, perSecond: 10 },
      chat: { capacity: 6, perSecond: 1.5 },
      create: { capacity: 3, perSecond: 0.05 },
      draw: { capacity: 30, perSecond: 6 },
    });
    limiters.set(user, l);
  }
  return l;
}

const json = (body: ApiResponse, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
const failure = (message: string, status = 400) => json({ ok: false, message }, status);

class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

type Tx = postgres.TransactionSql;

/** The public state minus fields that change on their own, to tell whether anything visible changed. */
function visibleKey(s: RoomState): string {
  const { serverNow: _n, rev: _r, ...rest } = s;
  return JSON.stringify(rest);
}

/** Who may join which Realtime channel: room members, this turn's drawer and solvers. */
function accessKey(d: RoomData): string {
  return JSON.stringify([d.players.map((p) => p.id).sort(), d.turnId, d.drawerId, d.players.filter((p) => p.guessed).map((p) => p.id).sort()]);
}

async function syncAccess(tx: Tx, d: RoomData) {
  const ids = d.players.map((p) => p.id);
  await tx`delete from public.room_players where room_code = ${d.code} and not (user_id = any(${ids}::uuid[]))`;
  if (ids.length) {
    await tx`insert into public.room_players ${tx(ids.map((user_id) => ({ room_code: d.code, user_id })))} on conflict do nothing`;
  }
  await tx`delete from public.turn_access where room_code = ${d.code} and turn_id <> ${d.turnId}`;
  const rows = d.players
    .filter((p) => p.id === d.drawerId || p.guessed)
    .map((p) => ({ room_code: d.code, turn_id: d.turnId, user_id: p.id, can_draw: p.id === d.drawerId, solved: p.guessed }));
  await tx`delete from public.turn_access where room_code = ${d.code} and not (user_id = any(${rows.map((r) => r.user_id)}::uuid[]))`;
  if (rows.length && d.turnId > 0) {
    await tx`insert into public.turn_access ${tx(rows)}
      on conflict (room_code, turn_id, user_id) do update set can_draw = excluded.can_draw, solved = excluded.solved`;
  }
}

async function applyEffects(tx: Tx, d: RoomData, effects: Effect[]) {
  for (const e of effects) {
    if (e.kind === "gameStarted") {
      await tx`delete from public.drawings where room_code = ${d.code}`;
    } else if (e.kind === "turnEnded") {
      await tx`update public.drawings
        set finished = true, word = ${e.word.word}, category_id = ${e.word.categoryId},
            drawer_name = ${e.drawerName}, drawer_color = ${e.drawerColor}, updated_at = now()
        where room_code = ${d.code} and turn_id = ${e.turnId} and points > 0`;
      await tx`delete from public.drawings where room_code = ${d.code} and turn_id <= ${e.turnId - LIMITS.galleryMax}`;
    }
  }
}

function outgoing(game: Game, state: RoomState, stateChanged: boolean): Broadcast[] {
  const out: Broadcast[] = [];
  const code = game.data.code;
  for (const e of game.effects) {
    if (e.kind !== "chat") continue;
    out.push({
      topic: e.scope === "solved" ? `solved:${code}:${game.data.turnId}` : `room:${code}`,
      event: "chat",
      payload: e.line,
    });
  }
  if (stateChanged) out.push({ topic: `room:${code}`, event: "state", payload: state });
  return out;
}

interface RoomOutcome {
  game: Game;
  state: RoomState;
  rev: number;
}

/**
 * Load a room under a row lock, let `fn` act on it, move past any passed deadline,
 * save, and broadcast what changed. `fn` may throw ApiError to abort without saving.
 */
async function withRoom(code: string, user: string, fn: (game: Game, now: number) => void, opts: { allowStranger?: boolean } = {}): Promise<RoomOutcome> {
  const sql = db();
  const outcome = await sql.begin(async (tx) => {
    const [row] = await tx<{ data: RoomData; rev: number }[]>`select data, rev from public.rooms where code = ${code} for update`;
    if (!row) throw new ApiError(`No room with code ${code}. Check the code or create a new room.`, 404);
    const now = Date.now();
    const game = new Game(row.data);
    if (!opts.allowStranger && !game.hasPlayer(user)) throw new ApiError("You're not in this room anymore. Join again from the invite link.", 403);
    const beforeVisible = visibleKey(game.state(now, row.rev));
    const beforeAccess = accessKey(game.data);
    game.touch(user, now);
    game.advance(now);
    fn(game, now);
    game.advance(now);

    if (game.isEmpty) {
      await tx`delete from public.rooms where code = ${code}`;
      return { game, state: game.state(now, row.rev + 1), rev: row.rev + 1, visibleChanged: false };
    }
    const rev = row.rev + 1;
    await tx`update public.rooms set data = ${tx.json(game.data as never)}, rev = ${rev}, updated_at = now() where code = ${code}`;
    if (accessKey(game.data) !== beforeAccess) await syncAccess(tx, game.data);
    await applyEffects(tx, game.data, game.effects);
    const state = game.state(now, rev);
    return { game, state, rev, visibleChanged: visibleKey(state) !== beforeVisible };
  });
  // Broadcast only after the transaction commits, so nobody sees a state that was rolled back.
  await broadcast(outgoing(outcome.game, outcome.state, outcome.visibleChanged));
  return outcome;
}

function newCode(): string {
  let code = "";
  for (let i = 0; i < LIMITS.roomCodeLength; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

async function createRoom(user: string, name: string, color: string): Promise<RoomOutcome> {
  const sql = db();
  // Clean up rooms nobody has touched for a while (cascades to players, access and drawings).
  if (Math.random() < 0.1) await sql`delete from public.rooms where updated_at < now() - interval '6 hours'`;
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = newCode();
    const now = Date.now();
    const game = new Game(newRoom(code));
    const res = game.join({ id: user, name, color }, now);
    if (!res.ok) throw new ApiError(res.message);
    const created = await sql.begin(async (tx) => {
      const rows = await tx`insert into public.rooms (code, data, rev) values (${code}, ${tx.json(game.data as never)}, 1)
        on conflict (code) do nothing returning code`;
      if (!rows.length) return false;
      await syncAccess(tx, game.data);
      return true;
    });
    if (created) return { game, state: game.state(now, 1), rev: 1 };
  }
  throw new ApiError("Couldn't find a free room code. Try again.", 503);
}

const ok = (o: RoomOutcome, user: string, extra: Partial<Extract<ApiResponse, { ok: true }>> = {}) =>
  json({ ok: true, state: o.state, you: user, private: o.game.privateFor(user), lines: o.game.privateLines, ...extra });

function check(r: { ok: true } | { ok: false; message: string }) {
  if (!r.ok) throw new ApiError(r.message);
}

async function handleDrawSync(user: string, req: Extract<ValidRequest, { action: "drawSync" }>): Promise<Response> {
  const sql = db();
  const [room] = await sql<{ data: RoomData }[]>`select data from public.rooms where code = ${req.code}`;
  if (!room) throw new ApiError("Room not found", 404);
  const d = room.data;
  if (d.drawerId !== user || d.turnId !== req.turnId || (d.phase !== "drawing" && d.phase !== "reveal")) {
    return json({ ok: true });
  }
  const drawer = d.players.find((p) => p.id === user)!;
  const result = await sql.begin(async (tx) => {
    const [row] = await tx<{ actions: DrawAction[] }[]>`select actions from public.drawings
      where room_code = ${req.code} and turn_id = ${req.turnId} for update`;
    const existing = row?.actions ?? [];
    if (req.keep > existing.length) return "resync" as const;
    const next = existing.slice(0, req.keep).concat(req.append as DrawAction[]);
    const points = next.reduce((n, a) => n + (a.kind === "stroke" ? a.points.length : 2), 0);
    if (next.length > LIMITS.actionsPerTurn || points > LIMITS.pointsPerTurn) return "full" as const;
    await tx`insert into public.drawings (room_code, turn_id, drawer_id, drawer_name, drawer_color, actions, points)
      values (${req.code}, ${req.turnId}, ${user}, ${drawer.name}, ${drawer.color}, ${tx.json(next as never)}, ${points})
      on conflict (room_code, turn_id) do update set actions = excluded.actions, points = excluded.points, updated_at = now()`;
    return "ok" as const;
  });
  if (result === "resync") return failure("resync", 409);
  if (result === "full") return failure("This drawing is as big as it can get. Undo or clear to keep drawing.", 413);
  return json({ ok: true });
}

async function memberRoom(code: string, user: string): Promise<RoomData> {
  const sql = db();
  const [room] = await sql<{ data: RoomData }[]>`select r.data from public.rooms r
    join public.room_players p on p.room_code = r.code and p.user_id = ${user}
    where r.code = ${code}`;
  if (!room) throw new ApiError("You're not in this room anymore. Join again from the invite link.", 403);
  return room.data;
}

async function dispatch(user: string, req: ValidRequest): Promise<Response> {
  const limiter = limiterFor(user);
  if (!limiter.take("any")) throw new ApiError("Slow down a little.", 429);

  switch (req.action) {
    case "create": {
      if (!limiter.take("create")) throw new ApiError("Too many new rooms. Wait a minute and try again.", 429);
      return ok(await createRoom(user, req.name, req.color), user);
    }
    case "join":
      return ok(await withRoom(req.code, user, (g, now) => check(g.join({ id: user, name: req.name, color: req.color }, now)), { allowStranger: true }), user);
    case "sync":
      return ok(await withRoom(req.code, user, () => {}), user);
    case "leave":
      await withRoom(req.code, user, (g, now) => g.leave(user, now));
      return json({ ok: true });
    case "settings":
      return ok(await withRoom(req.code, user, (g) => check(g.updateSettings(user, req.settings))), user);
    case "start":
      return ok(await withRoom(req.code, user, (g, now) => check(g.start(user, now))), user);
    case "again":
      return ok(await withRoom(req.code, user, (g) => check(g.again(user))), user);
    case "choose":
      return ok(await withRoom(req.code, user, (g, now) => check(g.choose(user, req.index, now))), user);
    case "chat":
      if (!limiter.take("chat")) throw new ApiError("You're sending messages too fast.", 429);
      return ok(await withRoom(req.code, user, (g, now) => g.chat(user, req.text, now)), user);
    case "react":
      return ok(await withRoom(req.code, user, (g) => g.react(user, req.kind)), user);
    case "drawing": {
      const d = await memberRoom(req.code, user);
      const [row] = await db()<{ actions: DrawAction[] }[]>`select actions from public.drawings
        where room_code = ${req.code} and turn_id = ${d.turnId}`;
      return json({ ok: true, actions: row?.actions ?? [] });
    }
    case "drawSync":
      if (!limiter.take("draw")) throw new ApiError("Drawing sync is too fast.", 429);
      return handleDrawSync(user, req);
    case "gallery": {
      await memberRoom(req.code, user);
      const rows = await db()<
        { turn_id: number; drawer_name: string; drawer_color: string; word: string; category_id: string; actions: DrawAction[]; points: number }[]
      >`select turn_id, drawer_name, drawer_color, word, category_id, actions, points from public.drawings
        where room_code = ${req.code} and finished order by turn_id desc limit ${LIMITS.galleryMax}`;
      // Keep the response small enough for a function response: newest drawings first, up to the cap.
      const items: GalleryItem[] = [];
      let total = 0;
      for (const r of rows) {
        if (total + r.points > LIMITS.galleryPoints && items.length) break;
        total += r.points;
        items.push({ id: `${req.code}-${r.turn_id}`, drawerName: r.drawer_name, drawerColor: r.drawer_color, word: r.word, categoryId: r.category_id, actions: r.actions });
      }
      return json({ ok: true, gallery: items.reverse() });
    }
  }
}

/** POST /api/game */
export async function handleGame(request: Request): Promise<Response> {
  if (request.method !== "POST") return failure("Use POST.", 405);
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return failure("Sign-in is missing. Refresh the page.", 401);

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY) return failure("Request too large.", 413);
  const text = await request.text();
  if (text.length > MAX_BODY) return failure("Request too large.", 413);

  let user: string | null;
  try {
    user = await verifyUser(token);
  } catch (err) {
    console.error("[auth]", err);
    return failure("Sign-in check failed. Try again.", 503);
  }
  if (!user) return failure("Your session expired. Refresh the page.", 401);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return failure("Invalid request.");
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? "Invalid request.");

  try {
    return await dispatch(user, parsed.data);
  } catch (err) {
    if (err instanceof ApiError) return failure(err.message, err.status);
    console.error(`[api ${parsed.data.action}]`, err);
    return failure("Something went wrong on the server. Try again.", 500);
  }
}
