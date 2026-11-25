import { AVATAR_COLORS, LIMITS } from "../../../shared/constants";

export interface Profile {
  name: string;
  color: string;
}

const KEY = "sketchy:profile";
const SESSION_KEY = "sketchy:session";

export function loadProfile(): Profile {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<Profile> | null;
    const color = AVATAR_COLORS.includes(raw?.color as (typeof AVATAR_COLORS)[number]) ? raw!.color! : randomColor();
    return { name: (raw?.name ?? "").slice(0, LIMITS.nameMax), color };
  } catch {
    return { name: "", color: randomColor() };
  }
}

export function saveProfile(p: Profile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* private mode: profile just won't persist */
  }
}

function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

/** A per-tab session id, so a refresh rejoins the same seat but two tabs are two players. */
export function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
