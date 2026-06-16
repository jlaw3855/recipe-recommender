# Recipe Recommender

A web app that suggests recipes based on ingredients you have on hand, plus dietary preferences, complexity, prep time, and taste profile. Each result includes country of origin and a short historical summary.

## Features

- **Ingredient-based search** with match scores, filters (diet, complexity, max prep time), and taste profiles
- **Recipe detail view** with full instructions, ingredient list, and history
- **Two data modes:**
  - **Bundled** — 150 curated offline recipes, zero API calls
  - **Live** — Spoonacular API for real-time search and detail
- **In-app data mode settings** — switch between bundled and live mode from the header; live mode prompts for a Spoonacular API key and persists changes to `.env` (no server restart required)
- **Mode-aware ingredient autocomplete:**
  - **Bundled:** suggestions from `common-ingredients.json` only
  - **Live:** local-first hybrid with prefix cache; calls Spoonacular only when local matches are insufficient
- **API quota tracking** — daily call counter with in-memory search, detail, and autocomplete caches to minimize usage

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Spoonacular API key](https://spoonacular.com/food-api) — required only for **live** mode (free tier ≈ 50 points/day)

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment** (optional — you can also configure via the in-app Settings panel):

   ```bash
   cp .env.example .env
   ```

3. **Start dev servers:**

   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) (client proxies `/api` to the server on port 3001)

## Data modes

| Mode | Source | API calls |
|------|--------|-----------|
| **Bundled** | `server/src/data/recipes.json` (150 recipes) | **0** |
| **Live** | Spoonacular | **1 per search + 1 per recipe opened** (+ occasional autocomplete) |

Use **Settings** in the app header to switch modes. Selecting live mode requires a Spoonacular API key; the key is saved to `.env` as `SPOONACULAR_API_KEY`.

Legacy `.env` value `DATA_MODE=auto` (live if key is set, otherwise bundled) is still supported when editing `.env` manually, but the settings UI exposes only **bundled** and **live**.

## API quota optimizations

Designed for Spoonacular's **50 requests/day** free tier:

| Feature | Strategy |
|---------|----------|
| Search | **1 call** — lightweight list from `findByIngredients`; no detail prefetch |
| Recipe detail | **1 call on click** — cached in memory |
| Ingredient autocomplete (live) | **Local-first** — uses `common-ingredients.json`; calls Spoonacular only when local results &lt; 3; exact + prefix query cache avoids repeat calls |
| Ingredient autocomplete (bundled) | **0 calls** — local list only |
| Repeat search | **0 calls** — search result cache keyed by query + mode |

**Typical live-mode usage:** ~50 searches/day, or ~25 searches + 25 detail views.

## How it works

- **Frontend:** React + TypeScript + Tailwind CSS (Vite dev server on `:5173`)
- **Backend:** Express API on `:3001` with bundled dataset + optional Spoonacular integration
- **Bundled mode:** Full metadata, history, and instructions in `recipes.json`; autocomplete from `common-ingredients.json`
- **Live mode:** Search returns ingredient-match cards; full recipe loads on click; autocomplete falls back to Spoonacular for uncommon ingredients

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client and server in development mode |
| `npm run build` | Build both client and server for production |
| `npm start` | Run the production server (`server/dist`) |

## Project structure

```
├── client/                         React frontend (Vite)
│   └── src/
│       ├── api/                    recipes.ts, config.ts
│       ├── components/             SearchForm, IngredientInput, RecipeCard,
│       │                           RecipeDetail, DataModeSettings, …
│       ├── hooks/                  useRecipeSearch
│       └── types/                  Shared TypeScript types
├── server/
│   ├── scripts/
│   │   ├── copy-data.mjs           Copy data files into dist/ on build
│   │   └── generate-recipes.mjs    One-off script to expand recipes.json
│   └── src/
│       ├── data/
│       │   ├── recipes.json        150 bundled recipes (offline mode)
│       │   └── common-ingredients.json  Local autocomplete vocabulary
│       ├── routes/
│       │   ├── config.ts           GET/PATCH /api/config (data mode settings)
│       │   └── recipes.ts          Search, detail, autocomplete
│       └── services/
│           ├── recipeService.ts    Unified search/detail/autocomplete facade
│           ├── bundledRecipes.ts   Offline search logic
│           ├── bundledData.ts      JSON data loaders
│           ├── spoonacular.ts      Live API client
│           ├── config.ts           Data mode, quota, settings persistence
│           ├── envFile.ts          Read/write .env from the server
│           └── cache.ts            Search + autocomplete caches
├── .env.example
└── package.json                    npm workspaces (client + server)
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/status` | Current mode, quota usage, bundled recipe count |
| `GET` | `/api/config` | Data mode settings (key masked to last 4 chars) |
| `PATCH` | `/api/config` | Update `dataMode` and/or `spoonacularApiKey` |
| `POST` | `/api/recipes/search` | Search recipes by ingredients + filters |
| `GET` | `/api/recipes/autocomplete?q=` | Ingredient suggestions (mode-aware) |
| `GET` | `/api/recipes/:id` | Recipe detail |

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_MODE` | `bundled` in `.env.example` | `bundled`, `live`, or `auto` (legacy) |
| `SPOONACULAR_API_KEY` | — | Required for live mode |
| `DAILY_API_QUOTA` | `50` | Max API calls tracked per server session |
| `PORT` | `3001` | Express server port |

`.env` is gitignored. The in-app Settings panel updates `DATA_MODE` and `SPOONACULAR_API_KEY` in place.
