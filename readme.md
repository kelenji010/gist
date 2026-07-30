# gist

Weekly icon puzzle. **All app code is in `myapp/`.**

## Run locally

```bash
cd myapp
npm install
npm run dev
```

Copy `myapp/.env.example` → `myapp/.env` and add your Supabase keys.
Then run the SQL in `myapp/supabase/schema.sql` (or `weekly_scores_collectibles.sql`) in the Supabase SQL editor.

## Deploy (Render)

- Root directory: `myapp`
- Build: `npm install && npm run build`
- Start: `node build`
- Env: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `NODE_VERSION=20`

## How it works

- One puzzle play **per username per week**
- Finishing assigns a random username (`Gist_xxxx`), saves score + collectible to Supabase
- Same browser can’t replay that week (and the server rejects duplicate username/week scores)

## Pages

| Page        | URL            |
|-------------|----------------|
| Home        | `/`            |
| Puzzle      | `/puzzle`      |
| Result      | `/result`      |
| Scoreboard  | `/leaderboard` |
| Terms       | `/terms`       |
