import type { RealtimeChannel } from "@supabase/supabase-js";
import type {
  ApiRequest,
  ApiResponse,
  ChatLine,
  DrawAction,
  DrawEvent,
  PrivateView,
  RoomState,
  Settings,
  StrokeAction,
} from "../../../shared/types";
import { play } from "./sound";
import { drawing, getState, setState, toast } from "./store";
import { accessToken, supabase } from "./supabase";

type Ok = Extract<ApiResponse, { ok: true }>;

export class ApiFailure extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const HEARTBEAT_MS = 10_000;
const DRAW_FLUSH_MS = 100;
const DRAW_SYNC_MS = 1000;

let code: string | null = null;
let roomCh: RealtimeChannel | null = null;
let drawCh: { ch: RealtimeChannel; turn: number } | null = null;
let solvedCh: { ch: RealtimeChannel; turn: number } | null = null;
let heartbeat: ReturnType<typeof setInterval> | null = null;
let uploader: ReturnType<typeof setInterval> | null = null;
let flusher: ReturnType<typeof setInterval> | null = null;
let tickTimer: ReturnType<typeof setTimeout> | null = null;
const tickedFor = new Set<number>();

// ---------- HTTP API ----------

async function call(req: ApiRequest): Promise<Ok> {
  const token = await accessToken();
  let res: Response;
  try {
    res = await fetch("/api/game", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(req),
    });
  } catch {
    throw new ApiFailure("Can't reach the game server. Check your connection.", 0);
  }
  let body: ApiResponse;
  try {
    body = (await res.json()) as ApiResponse;
  } catch {
    throw new ApiFailure("The game server didn't answer properly. Try again.", res.status);
  }
  if (!body.ok) throw new ApiFailure(body.message, res.status);
  if (body.you) setState({ you: body.you });
  if (body.state && body.state.code === code) applyState(body.state, body.private);
  body.lines?.forEach(addLine);
  return body;
}

/** Run an action and show its error as a toast instead of throwing. */
async function act(req: ApiRequest) {
  try {
    await call(req);
  } catch (e) {
    handleFailure(e);
  }
}

function handleFailure(e: unknown) {
  if (e instanceof ApiFailure && (e.status === 403 || e.status === 404) && code) {
    stop();
    setState({ room: null });
  }
  toast((e as Error).message);
}

let syncing = false;
async function sync() {
  if (!code || syncing) return;
  syncing = true;
  try {
    await call({ action: "sync", code });
  } catch (e) {
    if (e instanceof ApiFailure && e.status !== 0) handleFailure(e);
  } finally {
    syncing = false;
  }
}

// ---------- state ----------

function applyState(next: RoomState, priv?: PrivateView) {
  const s = getState();
  const prev = s.room;
  if (prev && prev.code === next.code && next.rev < prev.rev) {
    // An older state: keep private data only if it belongs to the current turn.
    if (priv && next.turnId === prev.turnId) setState(privPatch(priv, prev));
    return;
  }
  const newTurn = !prev || prev.turnId !== next.turnId;
  const patch: Parameters<typeof setState>[0] = { room: next, clockOffset: next.serverNow - Date.now() };
  if (newTurn) {
    patch.choices = null;
    patch.myWord = null;
    drawing.reset([]);
  }
  if (next.phase !== "choosing") patch.choices = null;
  if (next.phase === "lobby") patch.myWord = null;
  if (next.phase === "lobby" && prev?.phase !== "lobby") patch.gallery = [];
  if (priv) Object.assign(patch, privPatch(priv, next));
  if (prev && prev.phase !== next.phase) {
    if (next.phase === "choosing") play("turn");
    if (next.phase === "reveal") play("reveal");
    if (next.phase === "podium") play("win");
  }
  setState(patch);
  afterState(prev, next);
}

function privPatch(priv: PrivateView, room: RoomState) {
  const patch: Parameters<typeof setState>[0] = {};
  if (priv.choices && room.phase === "choosing") patch.choices = priv.choices;
  if (priv.word) patch.myWord = priv.word;
  return patch;
}

function afterState(prev: RoomState | null, room: RoomState) {
  const s = getState();
  const isDrawer = room.drawerId === s.you;
  void ensureTurnChannels(room);
  // A broadcast state carries no private data: fetch it when this player needs it.
  if (isDrawer && room.phase === "choosing" && !s.choices) void sync();
  if (isDrawer && room.phase === "drawing" && !s.myWord) void sync();
  if (room.phase === "podium" && prev?.phase !== "podium") void loadGallery();
  if (prev?.phase === "drawing" && room.phase !== "drawing") void uploadDrawing();
  scheduleTick(room);
}

/** Ask the server to move on when a deadline or hint time passes. Any player may; the server decides. */
function scheduleTick(room: RoomState) {
  if (tickTimer) clearTimeout(tickTimer);
  const offset = getState().clockOffset;
  const now = Date.now() + offset;
  const due = [room.phaseEndsAt, ...room.hintTimes].filter((t): t is number => !!t && !tickedFor.has(t));
  const next = due.filter((t) => t > now - 2000).sort((a, b) => a - b)[0];
  if (!next) return;
  // Spread players out so usually only one request does the work.
  const delay = Math.max(0, next - now) + 200 + Math.random() * 800;
  tickTimer = setTimeout(() => {
    tickedFor.add(next);
    if (tickedFor.size > 50) tickedFor.clear();
    void sync();
  }, delay);
}

function addLine(line: ChatLine) {
  const s = getState();
  if (s.chat.some((l) => l.id === line.id)) return;
  setState({ chat: [...s.chat.slice(-150), line] });
  if (line.kind === "correct") {
    if (line.playerId === s.you) {
      play("correct");
      setState({ myCorrectAt: Date.now() });
    } else play("otherCorrect");
  } else if (line.kind === "close") play("close");
  else if (line.kind === "system" && line.text.endsWith(" joined")) play("join");
}

async function loadGallery() {
  if (!code) return;
  try {
    const res = await call({ action: "gallery", code });
    setState({ gallery: res.gallery ?? [] });
  } catch {
    /* the podium still works without the gallery */
  }
}

// ---------- realtime ----------

async function channel(topic: string, handlers: Record<string, (payload: unknown) => void>, onStatus?: (ok: boolean) => void) {
  await supabase.realtime.setAuth();
  const ch = supabase.channel(topic, { config: { private: true, broadcast: { self: false } } });
  for (const [event, fn] of Object.entries(handlers)) ch.on("broadcast", { event }, ({ payload }) => fn(payload));
  ch.subscribe((status, err) => {
    if (status === "SUBSCRIBED") onStatus?.(true);
    else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
      if (err) console.warn(`[realtime] ${topic}: ${status}`, err.message);
      onStatus?.(false);
    }
  });
  return ch;
}

async function ensureTurnChannels(room: RoomState) {
  const you = getState().you;
  const inTurn = room.turnId > 0 && (room.phase === "choosing" || room.phase === "drawing" || room.phase === "reveal");
  if (!inTurn || drawCh?.turn !== room.turnId) {
    if (drawCh) void supabase.removeChannel(drawCh.ch);
    drawCh = null;
  }
  if (inTurn && !drawCh) {
    const turn = room.turnId;
    drawCh = { turn, ch: await channel(`draw:${room.code}:${turn}`, { draw: (p) => applyDrawEvent(p as DrawEvent) }) };
    // Joined mid-turn (or rejoined): fetch what has been drawn so far.
    if (room.phase !== "choosing" && room.drawerId !== you) void loadDrawing(turn);
  }
  const me = room.players.find((p) => p.id === you);
  const solver = inTurn && (room.drawerId === you || !!me?.guessed);
  if (!solver || solvedCh?.turn !== room.turnId) {
    if (solvedCh) void supabase.removeChannel(solvedCh.ch);
    solvedCh = null;
  }
  if (solver && !solvedCh) {
    solvedCh = { turn: room.turnId, ch: await channel(`solved:${room.code}:${room.turnId}`, { chat: (p) => addLine(p as ChatLine) }) };
  }
}

async function loadDrawing(turn: number) {
  if (!code) return;
  try {
    const res = await call({ action: "drawing", code });
    if (getState().room?.turnId === turn && res.actions) drawing.merge(res.actions);
  } catch {
    /* live strokes still arrive */
  }
}

function applyDrawEvent(ev: DrawEvent) {
  if (getState().room?.drawerId === getState().you) return;
  switch (ev.t) {
    case "begin":
      drawing.push({ ...ev.action, points: [...ev.action.points] });
      break;
    case "points":
      drawing.append(ev.id, ev.points);
      break;
    case "fill":
    case "clear":
      drawing.push(ev.action);
      break;
    case "undo":
      drawing.undo();
      break;
  }
}

// ---------- drawing (drawer side) ----------

let pendingStroke: string | null = null;
let pendingPoints: number[] = [];

function sendDraw(ev: DrawEvent) {
  void drawCh?.ch.send({ type: "broadcast", event: "draw", payload: ev });
}

function flushPoints() {
  if (!pendingStroke || !pendingPoints.length) return;
  for (let i = 0; i < pendingPoints.length; i += 400) {
    sendDraw({ t: "points", id: pendingStroke, points: pendingPoints.slice(i, i + 400) });
  }
  pendingPoints = [];
}

export const draw = {
  begin(action: StrokeAction) {
    flushPoints();
    drawing.push(action);
    pendingStroke = action.id;
    sendDraw({ t: "begin", action: { ...action, points: [...action.points] } });
  },
  points(id: string, points: number[]) {
    drawing.append(id, points);
    if (pendingStroke !== id) {
      flushPoints();
      pendingStroke = id;
    }
    pendingPoints.push(...points);
  },
  fill(action: Extract<DrawAction, { kind: "fill" }>) {
    flushPoints();
    drawing.push(action);
    sendDraw({ t: "fill", action });
  },
  clear(action: Extract<DrawAction, { kind: "clear" }>) {
    flushPoints();
    drawing.push(action);
    sendDraw({ t: "clear", action });
  },
  undo() {
    if (!drawing.actions.length) return;
    flushPoints();
    drawing.undo();
    sendDraw({ t: "undo" });
  },
  flush: flushPoints,
};

let uploading = false;
/** Keep the server's copy of the drawing current, for late joiners and the gallery. */
async function uploadDrawing() {
  const s = getState();
  const room = s.room;
  if (!code || !room || uploading || room.drawerId !== s.you) return;
  if (drawing.dirtyFrom === Infinity) return;
  const keep = Math.min(drawing.dirtyFrom, drawing.actions.length);
  const append = drawing.actions.slice(keep);
  drawing.dirtyFrom = Infinity;
  uploading = true;
  try {
    await call({ action: "drawSync", code, turnId: room.turnId, keep, append });
  } catch (e) {
    if (e instanceof ApiFailure && e.status === 409) drawing.markDirty(0);
    else if (e instanceof ApiFailure && e.status === 413) toast(e.message);
    else drawing.markDirty(keep);
  } finally {
    uploading = false;
  }
}

// ---------- room lifecycle ----------

function start(c: string) {
  stop();
  code = c;
  heartbeat = setInterval(() => void sync(), HEARTBEAT_MS);
  uploader = setInterval(() => void uploadDrawing(), DRAW_SYNC_MS);
  flusher = setInterval(flushPoints, DRAW_FLUSH_MS);
  void channel(
    `room:${c}`,
    {
      state: (p) => applyState(p as RoomState),
      chat: (p) => addLine(p as ChatLine),
    },
    (ok) => {
      setState({ connected: ok });
      if (ok) void sync();
    },
  ).then((ch) => {
    if (code === c) roomCh = ch;
    else void supabase.removeChannel(ch);
  });
}

function stop() {
  for (const t of [heartbeat, uploader, flusher]) if (t) clearInterval(t);
  if (tickTimer) clearTimeout(tickTimer);
  heartbeat = uploader = flusher = tickTimer = null;
  for (const ch of [roomCh, drawCh?.ch, solvedCh?.ch]) if (ch) void supabase.removeChannel(ch);
  roomCh = null;
  drawCh = solvedCh = null;
  code = null;
  setState({ connected: true });
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void sync();
  });
  window.addEventListener("online", () => void sync());
}

async function enter(req: Extract<ApiRequest, { action: "create" | "join" }>): Promise<string> {
  setState({ chat: [], gallery: [], choices: null, myWord: null, room: null });
  drawing.reset([]);
  const pendingCode = req.action === "join" ? req.code : null;
  code = pendingCode;
  const res = await call(req).catch((e) => {
    code = null;
    throw e;
  });
  const c = res.state!.code;
  start(c);
  applyState(res.state!, res.private);
  res.lines?.forEach(addLine);
  return c;
}

export const createRoom = (name: string, color: string) => enter({ action: "create", name, color });
export const joinRoom = (c: string, name: string, color: string) => enter({ action: "join", code: c, name, color });

export function leaveRoom() {
  const c = code;
  stop();
  if (c) void call({ action: "leave", code: c }).catch(() => {});
  drawing.reset([]);
  setState({ room: null, you: null, chat: [], choices: null, myWord: null, gallery: [] });
}

export const sendChat = (text: string) => code && act({ action: "chat", code, text });
export const updateSettings = (settings: Partial<Settings>) => code && act({ action: "settings", code, settings });
export const startGame = () => code && act({ action: "start", code });
export const playAgain = () => code && act({ action: "again", code });
export const chooseWord = (index: number) => code && act({ action: "choose", code, index });
export const react = (kind: "like" | "dislike") => code && act({ action: "react", code, kind });
