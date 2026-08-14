# Gist — beginner guide

Gist is a SvelteKit web app. Pages live under `src/routes/`. Shared helpers live under `src/lib/`.

## Run the app

```bash
cd myapp
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Where to edit what

| What you want to change | File |
| ----------------------- | ---- |
| Home / lobby screen | `src/routes/+page.svelte` |
| Puzzle board (build here!) | `src/routes/puzzle/+page.svelte` |
| Login form | `src/routes/login/+page.svelte` |
| Win / result screen | `src/routes/result/+page.svelte` |
| Scoreboard UI | `src/routes/leaderboard/+page.svelte` |
| Brand colors & shared buttons | `static/global.css` |
| Browser memory (played today, username) | `src/lib/player.js` |
| Database client | `src/lib/server/supabase.js` |
| Save / load scores | `src/lib/server/scores.js` |
| Scoreboard API | `src/routes/api/scoreboard/+server.js` |

Look for comments that say `EDIT HERE` — those mark the empty spots for your new UI.

## Folder map

```
myapp/
  src/
    routes/          ← each folder is a URL page
      +page.svelte   ← home (/)
      puzzle/        ← /puzzle
      login/         ← /login
      result/        ← /result
      leaderboard/   ← /leaderboard
      api/scoreboard ← backend endpoint for scores
    lib/
      player.js      ← localStorage helpers (client)
      server/        ← code that only runs on the server
  static/            ← images + global.css (public files)
  supabase/          ← SQL schema for the database
```

## Supabase setup (scores)

The scoreboard ships with this project's public anon key, so it works without a local `.env`.

To use a different project:

1. Copy `.env.example` → `.env` and paste your URL + key
2. Run `supabase/schema.sql` in the Supabase SQL editor


## Tips

- `$lib/...` means "import from `src/lib/...`"
- `goto('/puzzle')` navigates to another page
- Shared button classes: `btn-primary` and `btn-secondary` (defined in `static/global.css`)
- When the player wins, call `goto('/result')` from the puzzle page
