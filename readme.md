# gist: an inclusive puzzle storytelling game


<img src="https://raw.githubusercontent.com/kjelenji/gist/main/myapp/static/" alt="Gist Logo" width="130"/>

---

## How It Works
Gist is a word puzzle game where players solve a series of mini-puzzles — riddles, rebuses, and more — to piece together a story. Each correct answer reveals another part of the story.
Each game session presents a set of puzzles. Solve them to unlock fragments of a story. The better you do, the more of the story you uncover.

Puzzle types include:
- **Riddles** — classic word riddles
- **Rebuses** — decode image/symbol combinations into words
- **Word puzzles** — fill in the blanks to complete a sentence

---

## Tech Stack

- **Frontend:** [SvelteKit](https://kit.svelte.dev) + [Svelte 5](https://svelte.dev)
- **UI components:** [Flowbite Svelte](https://flowbite-svelte.com)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **AI:** Google Gemini API
- **Deployment:** [Render](https://render.com) (Node web service)

---

## Project Structure

```
gist/
├── myapp/                  # SvelteKit app
│   ├── src/
│   │   ├── lib/            # Shared components & utilities
│   │   ├── public/         # Static assets & styles
│   │   └── routes/         # SvelteKit pages
│   │       ├── +page.svelte        # Home / landing
│   │       ├── +layout.svelte      # App shell
│   │       ├── login/              # Login page
│   │       ├── puzzle/             # Game page
│   │       ├── story/              # Story reveal page
│   │       ├── share/              # Share results
│   │       └── terms/              # Terms of service
│   ├── static/             # Publicly served assets
│   ├── svelte.config.js
│   ├── vite.config.js
│   └── package.json
├── gist.js                 # Puzzle data / game logic
├── puzzleCore.js           # Core puzzle engine
├── rebus.js                # Rebus puzzle logic
├── riddle.js               # Riddle puzzle logic
├── render.yaml             # Render deployment config
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 16
- npm

### Install & Run

```bash
cd myapp
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
node build
```

---

## Deployment

The app is deployed on Render as a Node web service using `@sveltejs/adapter-node`.

The `render.yaml` at the repo root configures the service automatically:

```yaml
services:
  - type: web
    name: gist
    runtime: node
    rootDir: myapp
    buildCommand: npm install && npm run build
    startCommand: node build
```

### Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for AI-powered features |

---

## License

© 2026 Gist. All rights reserved.
