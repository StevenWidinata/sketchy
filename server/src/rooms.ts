import { randomInt } from "node:crypto";
import { LIMITS } from "../../shared/constants";
import { Room, type Transport } from "./game/Room";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const MAX_ROOMS = 2_000;

export class RoomManager {
  private rooms = new Map<string, Room>();

  constructor(private transportFor: (code: string) => Transport) {}

  private newCode(): string {
    for (let attempt = 0; attempt < 50; attempt++) {
      let code = "";
      for (let i = 0; i < LIMITS.roomCodeLength; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
      if (!this.rooms.has(code)) return code;
    }
    throw new Error("Could not allocate a room code");
  }

  create(): Room | null {
    if (this.rooms.size >= MAX_ROOMS) return null;
    const code = this.newCode();
    const room = new Room(code, this.transportFor(code), (c) => this.delete(c));
    this.rooms.set(code, room);
    return room;
  }

  get(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  delete(code: string): void {
    this.rooms.get(code)?.dispose();
    this.rooms.delete(code);
  }

  get count(): number {
    return this.rooms.size;
  }
}
