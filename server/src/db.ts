import postgres from "postgres";

let sql: postgres.Sql | null = null;

/**
 * Postgres through Supabase's transaction pooler. Prepared statements are off because a
 * transaction-mode pooler hands each transaction a different connection.
 */
export function db(): postgres.Sql {
  if (!sql) {
    const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!url) throw new Error("POSTGRES_URL is not set");
    sql = postgres(url, {
      prepare: false,
      max: 4,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: url.includes("localhost") ? false : "require",
      onnotice: () => {},
    });
  }
  return sql;
}
