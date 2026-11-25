# Sketchy

A free, realtime multiplayer drawing and guessing game. One player draws a word, everyone else races to guess it in chat. Play in any browser, on a phone or a laptop, with 2 to 20 friends.

- Create a room and share the 5-letter code or the invite link. No sign-up.
- 20 word categories, in English or Bahasa Indonesia. The category is shown while you guess.
- The host sets rounds, draw time, word choices, max players, language and categories, and can add custom words.
- Pen, eraser, fill bucket, 16 colors, 4 brush sizes, undo and clear. Works with mouse, finger and stylus.
- Letter hints at half time and three quarters. Faster guesses score more; the drawer scores for every solver.
- Like or dislike each drawing, sound effects with a mute button, and a raccoon mascot that reacts to the game.
- At the end: a podium and a gallery of every drawing, each replayable as a timelapse and saveable as a PNG.

## Run it locally

Needs Node 22 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:5173 in two browser windows (or a phone on the same network with `npx vite --host`) to play against yourself.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Game server on :3001 and the Vite dev server on :5173 |
| `npm run build` | Builds the website into `dist/client` |
| `npm start` | Runs the server, which also serves the built website |
| `npm test` | Unit tests for guessing, scoring, hints and the turn state machine |
| `npm run e2e` | Two browsers play a real round (uses your installed Chrome) |
| `npm run typecheck` | TypeScript check for client, server and shared code |

## Deploy

The repo includes `render.yaml`. In Render, choose **New > Blueprint**, pick this repository, and it creates one web service that builds the site and runs the game server. The free plan sleeps after about 15 minutes without visitors, so the first visit after a quiet spell takes up to a minute to wake.

Any Node host that keeps a long-running process and supports WebSockets works the same way: `npm ci && npm run build`, then `npm start` with `NODE_ENV=production`.

## How it works

- `client/` React + TypeScript (Vite). Plain CSS with design tokens, a hand-built SVG raccoon, and a canvas drawn at a fixed 1200 x 900 size on every device so fills replay identically.
- `server/` Express + Socket.IO. The server owns every timer, word and score; guessers never receive the word. All messages are validated with zod and rate limited.
- `shared/` Message types, limits and the word lists, used by both sides.

Game state lives in memory per room. Nothing is stored after a room empties.

## License

MIT
