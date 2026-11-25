import { io, type Socket } from "socket.io-client";
import type { ClientToServer, ServerToClient } from "../../../shared/types";

export type GameSocket = Socket<ServerToClient, ClientToServer>;

export const socket: GameSocket = io({
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnectionDelay: 500,
  reconnectionDelayMax: 4000,
});
