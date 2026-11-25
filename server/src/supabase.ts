import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | null = null;

/** Server-only Supabase client. Uses the secret key, which must never reach the browser. */
function client(): SupabaseClient {
  if (!admin) {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set");
    admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return admin;
}

/** Verify a player's access token and return their user id, or null. */
export async function verifyUser(token: string): Promise<string | null> {
  const { data, error } = await client().auth.getClaims(token);
  if (error || !data?.claims?.sub || data.claims.role !== "authenticated") return null;
  return data.claims.sub;
}

export interface Broadcast {
  topic: string;
  event: string;
  payload: unknown;
}

/** Send broadcasts to private Realtime channels over HTTP (no subscription needed). */
export async function broadcast(messages: Broadcast[]): Promise<void> {
  const sb = client();
  await Promise.all(
    messages.map(async (m) => {
      const channel = sb.channel(m.topic, { config: { private: true } });
      try {
        const res = await channel.httpSend(m.event, m.payload);
        if (!res.success) console.error(`[broadcast] ${m.topic} ${m.event} failed: ${res.status} ${res.error}`);
      } finally {
        await sb.removeChannel(channel);
      }
    }),
  );
}
