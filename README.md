# Sketchy

A free, realtime multiplayer drawing and guessing game. One player draws a word, everyone else races to guess it in chat. Play in any browser, on a phone or a laptop, with 2 to 20 friends.

- Create a room and share the 5-letter code or the invite link. No sign-up.
- 36 word categories with about 2,200 words, in English or Bahasa Indonesia. Three harder ones (feelings, idioms, two-person scenes) are off unless the host ticks them. The category is shown while you guess, and no word is shown twice in a game, even ones the drawer skipped.
- The host sets rounds, draw time, word choices, max players, language and categories, and can add custom words.
- Pen, eraser, fill bucket, 16 colors, 4 brush sizes, undo and clear. Works with mouse, finger and stylus.
- Letter hints at half time and three quarters. Faster guesses score more; the drawer scores for every solver.
- Like or dislike each drawing, sound effects with a mute button, and a raccoon mascot that reacts to the game.
- At the end: a podium and a gallery of every drawing, each replayable as a timelapse and saveable as a PNG.

## Run it locally

Needs Node 22 or newer and the Vercel CLI, linked to the project (`vercel link`).

```bash
npm install
vercel env pull .env.local   # Supabase URL and keys
npm run dev
```

Open http://localhost:5173 in two browser windows to play against yourself. Each tab is its own player.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | The website and the `/api/game` function together on :5173, like on Vercel |
| `npm run build` | Builds the website into `dist` |
| `npm run db:apply` | Runs any new files in `supabase/migrations` against the database |
| `npm test` | Unit tests for guessing, scoring, hints and the turn state machine |
| `npm run e2e` | Two browsers play a real round against the dev server (uses your installed Chrome) |
| `npm run typecheck` | TypeScript check for client, server and shared code |

## Deploy

Everything runs on free plans and redeploys on every push to `main`:

| Part | Host |
| --- | --- |
| Website and the `/api/game` function | Vercel, region Singapore (`vercel.json`) |
| Database, anonymous player accounts and realtime messages | Supabase free project, added through the Vercel Marketplace, region Singapore |

The Supabase keys reach Vercel through the Marketplace integration. The browser only gets `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; the secret key stays on the server.

Supabase settings that the game depends on (Dashboard):

- Authentication, Sign In / Providers: **Allow anonymous sign-ins** on.
- Realtime, Settings: **Allow public access** off, so only the database policies decide who hears a room.

A free Supabase project pauses after a week with no activity. Restore it from the Supabase dashboard if the game stops loading after a long break.

## How it works

- `client/` React + TypeScript (Vite). Plain CSS with design tokens, a hand-built SVG raccoon, and a canvas drawn at a fixed 1200 x 900 size on every device so fills replay identically. Each tab signs in to Supabase anonymously.
- `api/game.ts` One Vercel Function for every game action. It checks the player's token, loads the room from Postgres with a row lock, runs the game engine, saves the room and sends the result to the room's private Realtime channels. All requests are validated with zod and rate limited.
- `server/src/game/engine.ts` The game rules as a pure state machine. Timers are deadlines stored in the room, so whichever request comes next moves the game on.
- `supabase/migrations/` The tables and Realtime policies. Guessers never receive the word: only players in a room hear its channel, and only the current drawer can send strokes.
- `shared/` Message types, limits and the word lists, used by both sides.

Rooms are deleted when the last player leaves, and any room untouched for 6 hours is removed.

## License

MIT
