import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";

/**
 * Applies supabase/migrations/*.sql in filename order, once each, recording what ran in
 * supabase_migrations_applied. DDL goes over the direct (non-pooling) connection.
 */
const url =
  process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error("Set POSTGRES_URL_NON_POOLING (run `vercel env pull .env.local` first).");
  process.exit(1);
}

const dir = join(import.meta.dirname, "..", "supabase", "migrations");
const sql = postgres(url, {
  prepare: false,
  max: 1,
  ssl: url.includes("localhost") ? false : "require",
  onnotice: () => {},
});

try {
  await sql`
    create table if not exists public.supabase_migrations_applied (
      name text primary key,
      applied_at timestamptz not null default now()
    )`;
  await sql`alter table public.supabase_migrations_applied enable row level security`;

  const done = new Set(
    (await sql<{ name: string }[]>`select name from public.supabase_migrations_applied`).map(
      (r) => r.name,
    ),
  );
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    if (done.has(file)) {
      console.log(`skip  ${file}`);
      continue;
    }
    const body = await readFile(join(dir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into public.supabase_migrations_applied (name) values (${file})`;
    });
    console.log(`apply ${file}`);
  }
} finally {
  await sql.end();
}
