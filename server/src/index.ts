import { createServer } from "node:http";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import helmet from "helmet";
import { Server, type Socket } from "socket.io";
import type { ClientToServer, ServerToClient } from "../../shared/types";
import type { Transport } from "./game/Room";
import { RateLimiter, SOCKET_LIMITS } from "./rateLimit";
import { RoomManager } from "./rooms";
import {
  chatSchema,
  chooseSchema,
  clearSchema,
  fillSchema,
  joinSchema,
  pointsSchema,
  reactSchema,
  settingsSchema,
  strokeSchema,
} from "./validate";

const PORT = Number(process.env.PORT ?? 3001);
const isProd = process.env.NODE_ENV === "production";
const here = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(here, "../../dist");

const app = express();
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "blob:"],
        "font-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
        "media-src": ["'self'"],
        "object-src": ["'none'"],
        "frame-ancestors": ["'none'"],
      },
    },
  }),
);

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, rooms: rooms.count });
});

/** Where the website lives when it is hosted separately (Vercel). Server-controlled config. */
const CLIENT_URL = process.env.CLIENT_URL?.replace(/\/+$/, "");

if (existsSync(clientDir)) {
  app.use(express.static(clientDir, { index: false, maxAge: "1h" }));
  app.get(["/", "/r/:code"], (_req, res) => res.sendFile(path.join(clientDir, "index.html")));
} else if (CLIENT_URL) {
  // Someone opened the game server's own address: send them to the website.
  app.get("/", (_req, res) => res.redirect(302, CLIENT_URL));
  app.get("/r/:code", (req, res) => {
    const code = /^[A-Za-z]{5}$/.test(req.params.code) ? `/r/${req.params.code.toUpperCase()}` : "";
    res.redirect(302, `${CLIENT_URL}${code}`);
  });
}

/**
 * Browser origins allowed to connect. CLIENT_ORIGINS is a comma-separated list
 * (e.g. https://sketchy.vercel.app). Same-origin and local dev are always allowed.
 */
const allowedOrigins = new Set(
  [
    ...(process.env.CLIENT_ORIGINS ?? "").split(","),
    CLIENT_URL ?? "",
    ...(isProd ? [] : ["http://localhost:5173", "http://127.0.0.1:5173"]),
  ]
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean),
);
/** Optional regex for Vercel preview deployments, e.g. ^https://sketchy-[a-z0-9-]+-myteam\.vercel\.app$ */
const previewOrigin = process.env.CLIENT_ORIGIN_PATTERN ? new RegExp(process.env.CLIENT_ORIGIN_PATTERN) : null;

function originAllowed(origin: string | undefined, host: string | undefined): boolean {
  if (!origin) return true; // non-browser clients and same-origin polling requests
  if (allowedOrigins.has(origin) || previewOrigin?.test(origin)) return true;
  try {
    return new URL(origin).host === host; // the server's own website (single-service deploy)
  } catch {
    return false;
  }
}

const httpServer = createServer(app);

type Io = Server<ClientToServer, ServerToClient>;
const io: Io = new Server(httpServer, {
  maxHttpBufferSize: 64 * 1024,
  cors: { origin: (origin, cb) => cb(null, !origin || allowedOrigins.has(origin) || !!previewOrigin?.test(origin)) },
  // WebSocket upgrades skip CORS in browsers, so check the Origin header here too.
  allowRequest: (req, cb) => cb(null, originAllowed(req.headers.origin, req.headers.host)),
  pingInterval: 20_000,
  pingTimeout: 20_000,
});

function transportFor(code: string): Transport {
  return {
    toRoom: (event, ...args) => io.to(code).emit(event, ...args),
    toSocket: (socketId, event, ...args) => io.to(socketId).emit(event, ...args),
    toRoomExcept: (socketId, event, ...args) => io.to(code).except(socketId).emit(event, ...args),
  };
}

const rooms = new RoomManager(transportFor);

interface SocketData {
  code?: string;
  playerId?: string;
  sessionId?: string;
}

/** Client IP. Behind Render's proxy the last X-Forwarded-For hop is the one the proxy added. */
function clientIp(socket: Socket): string {
  const xff = socket.handshake.headers["x-forwarded-for"];
  const raw = Array.isArray(xff) ? xff.join(",") : xff;
  const hops = raw?.split(",").map((s) => s.trim()).filter(Boolean);
  return (isProd && hops?.length ? hops[hops.length - 1] : socket.handshake.address) || "unknown";
}

const MAX_SOCKETS_PER_IP = 30;
const socketsPerIp = new Map<string, number>();
// Room creation is limited per IP as well as per socket, so opening many tabs doesn't get around it.
const ipLimiters = new Map<string, RateLimiter>();
const limiterForIp = (ip: string) => {
  let l = ipLimiters.get(ip);
  if (!l) {
    l = new RateLimiter({ create: { capacity: 10, perSecond: 0.1 } });
    ipLimiters.set(ip, l);
  }
  return l;
};
setInterval(() => {
  for (const ip of ipLimiters.keys()) if (!socketsPerIp.has(ip)) ipLimiters.delete(ip);
}, 10 * 60_000).unref();

io.on("connection", (socket: Socket<ClientToServer, ServerToClient, never, SocketData>) => {
  const ip = clientIp(socket);
  const open = (socketsPerIp.get(ip) ?? 0) + 1;
  if (open > MAX_SOCKETS_PER_IP) {
    socket.disconnect(true);
    return;
  }
  socketsPerIp.set(ip, open);
  socket.on("disconnect", () => {
    const n = (socketsPerIp.get(ip) ?? 1) - 1;
    if (n <= 0) socketsPerIp.delete(ip);
    else socketsPerIp.set(ip, n);
  });

  const limiter = new RateLimiter(SOCKET_LIMITS);

  const current = () => {
    const { code, playerId } = socket.data;
    if (!code || !playerId) return null;
    const room = rooms.get(code);
    return room ? { room, playerId } : null;
  };

  const leaveCurrent = (explicit: boolean) => {
    const c = current();
    if (!c) return;
    socket.leave(c.room.code);
    if (explicit) c.room.leave(c.playerId);
    else c.room.disconnect(c.playerId);
    socket.data = {};
  };

  const enter = (room: NonNullable<ReturnType<typeof rooms.get>>, payload: { name: string; color: string; sessionId: string }) => {
    socket.join(room.code);
    const result = room.join({ ...payload, socketId: socket.id });
    if (!result.ok || !result.playerId) {
      socket.leave(room.code);
      return result;
    }
    socket.data = { code: room.code, playerId: result.playerId, sessionId: payload.sessionId };
    return result;
  };

  socket.on("room:create", (raw, ack) => {
    if (typeof ack !== "function") return;
    if (!limiter.take("join")) return ack({ ok: false, message: "Too many attempts. Wait a few seconds and try again." });
    const parsed = joinSchema.safeParse(raw);
    if (!parsed.success) return ack({ ok: false, message: "Check your name and color, then try again." });
    if (!limiterForIp(ip).take("create")) return ack({ ok: false, message: "Too many new rooms from your network. Wait a minute and try again." });
    leaveCurrent(true);
    const room = rooms.create();
    if (!room) return ack({ ok: false, message: "The server is full right now. Try again in a minute." });
    const result = enter(room, parsed.data);
    if (!result.ok) {
      rooms.delete(room.code);
      return ack(result);
    }
    ack({ ok: true, code: room.code });
  });

  socket.on("room:join", (raw, ack) => {
    if (typeof ack !== "function") return;
    if (!limiter.take("join")) return ack({ ok: false, message: "Too many attempts. Wait a few seconds and try again." });
    const parsed = joinSchema.safeParse(raw);
    if (!parsed.success || !parsed.data.code) return ack({ ok: false, message: "Room codes are 5 letters, like KQWPT." });
    const room = rooms.get(parsed.data.code);
    if (!room) return ack({ ok: false, message: `No room with code ${parsed.data.code}. Check the code or create a new room.` });
    // One socket holds one seat: switching rooms or sessions gives up the old seat first.
    const c = current();
    if (c && (c.room.code !== room.code || socket.data.sessionId !== parsed.data.sessionId)) leaveCurrent(true);
    const result = enter(room, parsed.data);
    if (!result.ok) return ack(result);
    ack({ ok: true, code: room.code });
  });

  socket.on("room:leave", () => leaveCurrent(true));
  socket.on("disconnect", () => leaveCurrent(false));

  // Every event below needs a room and passes its own validation and rate limit.
  const on = <E extends keyof ClientToServer>(
    event: E,
    bucket: keyof typeof SOCKET_LIMITS,
    handler: (ctx: NonNullable<ReturnType<typeof current>>, ...args: Parameters<ClientToServer[E]>) => void,
  ) => {
    socket.on(event, ((...args: Parameters<ClientToServer[E]>) => {
      const c = current();
      if (!c || !limiter.take(bucket)) return;
      try {
        handler(c, ...args);
      } catch (err) {
        console.error(`[${event}]`, err);
      }
    }) as never);
  };

  const notify = (r: { ok: boolean; message?: string }) => {
    if (!r.ok && r.message) socket.emit("room:error", { message: r.message });
  };

  on("room:settings", "settings", ({ room, playerId }, raw) => {
    const parsed = settingsSchema.safeParse(raw);
    if (parsed.success) notify(room.updateSettings(playerId, parsed.data));
  });
  on("game:start", "control", ({ room, playerId }) => notify(room.start(playerId)));
  on("game:again", "control", ({ room, playerId }) => notify(room.again(playerId)));
  on("turn:choose", "control", ({ room, playerId }, raw) => {
    const parsed = chooseSchema.safeParse(raw);
    if (parsed.success) room.choose(playerId, parsed.data);
  });
  on("turn:react", "control", ({ room, playerId }, raw) => {
    const parsed = reactSchema.safeParse(raw);
    if (parsed.success) room.react(playerId, parsed.data);
  });
  on("chat:send", "chat", ({ room, playerId }, raw) => {
    const parsed = chatSchema.safeParse(raw);
    if (parsed.success) room.chat(playerId, parsed.data);
  });
  on("draw:begin", "draw", ({ room, playerId }, raw) => {
    const parsed = strokeSchema.safeParse(raw);
    if (parsed.success) room.drawBegin(playerId, parsed.data);
  });
  on("draw:points", "draw", ({ room, playerId }, raw) => {
    const parsed = pointsSchema.safeParse(raw);
    if (parsed.success) room.drawPoints(playerId, parsed.data);
  });
  on("draw:fill", "draw", ({ room, playerId }, raw) => {
    const parsed = fillSchema.safeParse(raw);
    if (parsed.success) room.drawFill(playerId, parsed.data);
  });
  on("draw:clear", "draw", ({ room, playerId }, raw) => {
    const parsed = clearSchema.safeParse(raw);
    if (parsed.success) room.drawClear(playerId, parsed.data);
  });
  on("draw:undo", "draw", ({ room, playerId }) => room.drawUndo(playerId));
});

httpServer.listen(PORT, () => {
  console.log(`Sketchy server on http://localhost:${PORT}${isProd ? "" : " (dev: open http://localhost:5173)"}`);
});
