import { handleGame } from "../server/src/api.js";

/** POST /api/game: every game action. Runs on Vercel Functions (Node.js, Fluid Compute). */
export function POST(request: Request): Promise<Response> {
  return handleGame(request);
}
