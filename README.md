# Recipe Recommender

A web app that suggests recipes based on ingredients you have on hand, plus dietary preferences, complexity, prep time, and taste profile. Each result includes country of origin and a short historical summary.

## Features

- **Ingredient-based search** with match scores, filters (diet, complexity, max prep time), and taste profiles
- **Recipe detail view** with full instructions, ingredient list, and history
- **Two data modes:**
  - **Bundled** — 150 curated offline recipes, zero API calls
  - **Live** — Spoonacular API for real-time search and detail
- **In-app data mode settings** — switch between bundled and live mode from the header; live mode prompts for a Spoonacular API key and persists changes to the project root `.env` (no server restart required)
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

   Copy `.env.example` to `.env` at the **project root**:

   ```bash
   cp .env.example .env
   ```

   On Windows (PowerShell):

   ```powershell
   Copy-Item .env.example .env
   ```

3. **Start dev servers:**

   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` requests to the Express server on port `3001`.

## Data modes

| Mode | Source | API calls |
|------|--------|-----------|
| **Bundled** | `server/src/data/recipes.json` (150 recipes) | **0** |
| **Live** | Spoonacular | **1 per search + 1 per recipe opened** (+ occasional autocomplete) |

Use **Settings** in the app header to switch modes. Selecting live mode requires a Spoonacular API key; the key is saved to the project root `.env` as `SPOONACULAR_API_KEY`.

Legacy `.env` value `DATA_MODE=auto` (live if a key is set, otherwise bundled) is still supported when editing `.env` manually, but the settings UI exposes only **bundled** and **live**.

### Filter behavior by mode

| Filter | Bundled search | Live search |
|--------|----------------|-------------|
| Diet | Applied | Applied after opening recipe detail |
| Complexity | Applied | Applied after opening recipe detail |
| Max prep time | Applied | Applied after opening recipe detail |
| Taste profile | Used in match scoring | Used in match scoring after detail load |

Live search intentionally skips hard filters on the result list to avoid extra Spoonacular API calls. Bundled mode applies all filters during search because full metadata is available offline.

## API quota optimizations

Designed for Spoonacular's **50 requests/day** free tier:

| Feature | Strategy |
|---------|----------|
| Search | **1 call** — lightweight list from `findByIngredients`; no detail prefetch |
| Recipe detail | **1 call on click** — cached in memory |
| Ingredient autocomplete (live) | **Local-first** — uses `common-ingredients.json`; calls Spoonacular only when local results < 3; exact + prefix query cache avoids repeat calls |
| Ingredient autocomplete (bundled) | **0 calls** — local list only |
| Repeat search | **0 calls** — search result cache keyed by query + mode |

**Typical live-mode usage:** ~50 searches/day, or ~25 searches + 25 detail views.

## How it works

- **Frontend:** React + TypeScript + Tailwind CSS (Vite dev server on `:5173`)
- **Backend:** Express API on `:3001` with bundled dataset + optional Spoonacular integration
- **Bundled mode:** Full metadata, history, and instructions in `recipes.json`; autocomplete from `common-ingredients.json`
- **Live mode:** Search returns ingredient-match cards; full recipe loads on click; autocomplete falls back to Spoonacular for uncommon ingredients
- **Configuration:** Server and in-app settings read and write the project root `.env` via `server/src/paths.ts` so paths stay consistent in both development (`tsx`) and production (`dist/`)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client and server in development mode |
| `npm run build` | Build both client and server for production |
| `npm start` | Run the production server (`server/dist`) |
| `npm test` | Run server and client unit/component tests |
| `npm run test:server` | Run server Vitest suite only |
| `npm run test:client` | Run client Vitest suite only |
| `npm run test:e2e` | Run Playwright E2E tests (starts dev servers in bundled mode) |
| `npm run test:live` | Run server live-mode tests only (mocked Spoonacular; no network) |

## Testing

The suite has three layers and two server-side data-mode lanes. **No test calls the real Spoonacular API.**

| Layer | Scope | Mode |
|-------|--------|------|
| Server Vitest (`*.test.ts`) | Unit + HTTP integration | Bundled (offline dataset) |
| Server Vitest (`*.live.test.ts`) | Live-mode paths with mocked Spoonacular | Mock live |
| Client Vitest | Hooks, components, API helpers | Mocked `fetch` |
| Playwright E2E | Full browser flows | Bundled only |

| Command | What it runs |
|---------|--------------|
| `npm test` | 65 server + 20 client Vitest tests |
| `npm run test:live` | 9 server mock-live tests only (`*.live.test.ts`) |
| `npm run test:e2e` | 8 Playwright browser tests (ports 3011/5183) |

**Integrity check** after substantive changes:

```bash
npm test && npm run build && npm run test:e2e
```

**Mock live framework** (`server/src/test/live/`): central Spoonacular mock, env/quota/cache reset helpers, and fixtures. New live tests go in `server/src/**/*.live.test.ts` and import `spoonacularMocks` / `exhaustQuota` from `server/src/test/live/`. Agent skills: `.cursor/skills/bundled-mode-testing/` and `.cursor/skills/live-mode-testing/`.

**Client tests** mock `fetch` for `SearchForm`, `RecipeCard`, `IngredientInput`, `ResultsList`, and `useRecipeSearch`.

**E2E tests** cover bundled badge, search, filters, empty results, autocomplete, and recipe detail.

First-time E2E setup: `npx playwright install chromium`.

## Project structure

```
├── client/                         React frontend (Vite)
│   └── src/
│       ├── api/                    recipes.ts, config.ts
│       ├── components/             SearchForm, IngredientInput, RecipeCard,
│       │                           RecipeDetail, DataModeSettings, …
│       ├── hooks/                  useRecipeSearch
│       ├── types/                  Shared TypeScript types
│       └── utils/                  Client-side ingredient normalization
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
│       ├── services/
│       │   ├── recipeService.ts    Unified search/detail/autocomplete facade
│       │   ├── bundledRecipes.ts   Offline search logic
│       │   ├── bundledData.ts      JSON data loaders
│       │   ├── spoonacular.ts      Live API client
│       │   ├── config.ts           Data mode, quota, settings persistence
│       │   ├── envFile.ts          Upsert project root .env in place
│       │   └── cache.ts            Search + autocomplete caches
│       ├── paths.ts                Project root and .env path resolution
│       ├── app.ts                  Express app factory (used by tests)
│       ├── scoring.ts              Match score and hard-filter logic
│       ├── mappings.ts             Cuisine, diet, and taste mappings
│       ├── ingredientNormalize.ts  Canonical ingredient matching (server)
│       ├── constants.ts            Shared server constants
│       ├── types.ts                Shared server types
│       └── test/
│           ├── setup.ts            Bundled-mode Vitest env
│           ├── setup-live.ts       Mock-live Vitest bootstrap
│           ├── fixtures/           Spoonacular mock fixtures
│           └── live/               Mock-live framework (harness + mocks)
├── .cursor/skills/                 Agent skills for test workflows
├── .env.example                    Environment template (project root)
├── .env                            Local config (gitignored, project root)
├── e2e/                            Playwright E2E specs (bundled mode)
├── playwright.config.ts            Playwright configuration
└── package.json                    npm workspaces (client + server)
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/status` | Current mode, quota usage, bundled recipe count |
| `GET` | `/api/config` | Data mode settings (API key masked to last 4 characters) |
| `PATCH` | `/api/config` | Update `dataMode` and/or `spoonacularApiKey` |
| `POST` | `/api/recipes/search` | Search recipes by ingredients + filters |
| `GET` | `/api/recipes/autocomplete?q=` | Ingredient suggestions (mode-aware) |
| `GET` | `/api/recipes/:id` | Recipe detail |

Search and detail endpoints return an updated `status` object (mode, quota) alongside results.

## Environment variables

All variables live in `.env` at the **project root** (not inside `server/`).

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_MODE` | `bundled` in `.env.example` | `bundled`, `live`, or `auto` (legacy) |
| `SPOONACULAR_API_KEY` | — | Required for live mode |
| `DAILY_API_QUOTA` | `50` | Max API calls tracked per server session |
| `PORT` | `3001` | Express server port |

`.env` is gitignored. The in-app Settings panel updates `DATA_MODE` and `SPOONACULAR_API_KEY` in place, quoting values when needed for safe parsing.

## Security notes

- Never commit `.env` or paste real API keys into source code.
- The config API returns only the last four characters of a saved API key as a hint.
- `PATCH /api/config` has no authentication — intended for local development only. Do not expose the server directly to the public internet without adding auth.
