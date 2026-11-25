import { io, type Socket } from "socket.io-client";
import type { ClientToServer, ServerToClient } from "../../../shared/types";

export type GameSocket = Socket<ServerToClient, ClientToServer>;

/**
 * Where the game server lives. Empty means the same origin as the website (local dev through
 * the Vite proxy, or a single-service deploy). On Vercel it points at the server on Render.
 */
const SERVER_URL = import.meta.env.VITE_SERVER_URL?.trim() || undefined;

export const socket: GameSocket = io(SERVER_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnectionDelay: 500,
  reconnectionDelayMax: 4000,
});
