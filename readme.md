# gist

Weekly icon puzzle. **All app code is in `myapp/`.**

## Run locally

```bash
cd myapp
npm install
npm run dev
```

The scoreboard uses this project's public Supabase anon key by default.
To point at a different project, copy `myapp/.env.example` → `myapp/.env`.
Run `myapp/supabase/schema.sql` in the Supabase SQL editor if tables are missing.

## Deploy (Render)

- Root directory: `myapp`
- Build: `npm install && npm run build`
- Start: `node build`
- Env: `NODE_VERSION=20` (Supabase URL + anon key are set in `render.yaml`)

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
