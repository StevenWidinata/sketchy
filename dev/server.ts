/**
 * Local dev: the Vite dev server and the /api/game function on one port, like on Vercel.
 * Env vars come from .env.local (run `vercel env pull .env.local` once).
 */
import http from "node:http";
import { createServer as createVite } from "vite";
import { handleGame } from "../server/src/api.js";

const PORT = Number(process.env.PORT ?? 5173);
const vite = await createVite({ configFile: "vite.config.ts", server: { middlewareMode: true }, appType: "spa" });

http
  .createServer(async (req, res) => {
    if (!req.url?.startsWith("/api/game")) return vite.middlewares(req, res);
    try {
      const chunks: Buffer[] = [];
      for await (const c of req) chunks.push(c as Buffer);
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers.set(k, v);
      const response = await handleGame(
        new Request(`http://localhost:${PORT}${req.url}`, {
          method: req.method,
          headers,
          body: req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.concat(chunks),
        }),
      );
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch (err) {
      console.error(err);
      res.writeHead(500).end();
    }
  })
  .listen(PORT, () => console.log(`Sketchy dev on http://localhost:${PORT}`));
