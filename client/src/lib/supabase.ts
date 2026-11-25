import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set. Run `vercel env pull` for local dev.");
}

/**
 * Browser client with the publishable key only. The session lives in sessionStorage,
 * so each tab is its own player while a refresh keeps the same seat.
 */
export const supabase = createClient(url ?? "http://localhost", key ?? "missing", {
  auth: {
    storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
    storageKey: "sketchy-auth",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  realtime: { params: { eventsPerSecond: 20 } },
});

let signingIn: Promise<string> | null = null;

/** A valid access token, signing in anonymously the first time. */
export async function accessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.access_token;
  signingIn ??= supabase.auth
    .signInAnonymously()
    .then(({ data: d, error }) => {
      if (error || !d.session) {
        throw new Error(
          error?.status === 429
            ? "Too many new players from your network in the last hour. Try again later."
            : "Couldn't start a session. Check your connection and try again.",
        );
      }
      return d.session.access_token;
    })
    .finally(() => {
      signingIn = null;
    });
  return signingIn;
}
