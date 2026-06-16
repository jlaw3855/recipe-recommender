# Recipe Recommender

A web app that suggests recipes based on ingredients you have on hand, plus dietary preferences, complexity, prep time, and taste profile. Each result includes country of origin and a short historical summary.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- Optional: [Spoonacular API key](https://spoonacular.com/food-api) for live mode (free tier ≈ 50 points/day)

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

3. **Choose a data mode** in `.env`:

   | `DATA_MODE` | Behavior | API calls |
   |-------------|----------|-----------|
   | `bundled` | 150 curated offline recipes (recommended for dev/testing) | **0** |
   | `live` | Spoonacular API | **1 per search + 1 per recipe opened** |
   | `auto` | Live if API key is set, otherwise bundled | varies |

4. **Start dev servers:**

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173)

## API Quota Optimizations

The app is designed for a **50 requests/day** free tier:

| Feature | Before | After |
|---------|--------|-------|
| Search | 1 + 6 detail calls (~7) | **1 call** (lazy list from `findByIngredients`) |
| Ingredient autocomplete | 1 call per keystroke | **0 calls** (local ingredient list) |
| Recipe detail | fetched during search | **1 call on click** (cached in memory) |
| Repeat search | always hits API | **0 calls** (search result cache) |
| Dev/testing | requires API | **bundled mode** (30 recipes, no key needed) |

**Typical live-mode usage:** ~50 searches/day, or ~25 searches + 25 detail views.

## How It Works

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Express proxy with bundled dataset + optional Spoonacular integration
- **Bundled mode:** 150 recipes in `server/src/data/recipes.json` with full metadata, history, and instructions
- **Live mode:** Lightweight search returns ingredient-match cards; full history loads when you click a recipe

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client and server in development mode |
| `npm run build` | Build both client and server for production |
| `npm start` | Run the production server |

## Project Structure

```
├── client/                    React frontend
├── server/
│   ├── src/data/
│   │   ├── recipes.json       150 bundled recipes (offline mode)
│   │   └── common-ingredients.json
│   └── src/services/
│       ├── recipeService.ts   Unified search/detail facade
│       ├── bundledRecipes.ts  Offline search logic
│       └── spoonacular.ts     Live API client (lazy loading)
├── .env.example
└── package.json
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_MODE` | `auto` | `bundled`, `live`, or `auto` |
| `SPOONACULAR_API_KEY` | — | Required for live mode |
| `DAILY_API_QUOTA` | `50` | Max API calls tracked per day |
