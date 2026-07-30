# Gist

weekly puzzle game. **All app code is in `myapp/`.**

## Run the app

```bash
cd myapp
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

For a beginner-friendly map of every file, open **`myapp/README.md`**.

## Repo layout

```
Gist/
  README.md          ← you are here
  myapp/             ← the real SvelteKit app (edit files in here)
  .gitignore
```

## Pages

| Page   | URL        | File to edit                              |
|--------|------------|-------------------------------------------|
| Home   | `/`        | `myapp/src/routes/+page.svelte`           |
| Puzzle | `/puzzle`  | `myapp/src/routes/puzzle/+page.svelte`    |
| Login  | `/login`   | `myapp/src/routes/login/+page.svelte`     |
| Result | `/result`  | `myapp/src/routes/result/+page.svelte`    |
