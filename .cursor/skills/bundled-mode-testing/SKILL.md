---
name: bundled-mode-testing
description: >-
  Run and extend the Recipe Recommender bundled-mode test suite to verify basic
  functionality after code changes. Use when implementing features, fixing bugs,
  refactoring server or client code, adding tests, running npm test or test:e2e,
  or validating that search, autocomplete, and recipe detail still work offline
  without Spoonacular API calls.
---

# Bundled Mode Testing

Verify basic app integrity using the offline bundled dataset. Default project tests target **bundled mode** and must **never call the real Spoonacular API**. For live-mode server tests, see [live-mode-testing](../live-mode-testing/SKILL.md) — they use the shared framework under `server/src/test/live/`.

## When to run

Run this workflow after changes that touch:

- `server/src/` (routes, services, scoring, bundled data, config)
- `client/src/` (components, hooks, API clients)
- `e2e/`, `playwright.config.ts`, or test configs
- `server/src/data/recipes.json` or `common-ingredients.json`

## Integrity check (run in order)

From the **project root**:

```bash
npm test
npm run build
npm run test:e2e
```

| Step | Command | Expect |
|------|---------|--------|
| Unit + integration | `npm test` | 65 server + 20 client tests pass |
| Production build | `npm run build` | TypeScript + Vite build succeed |
| Full browser flow | `npm run test:e2e` | 8 Playwright tests pass |

Run subsets when scoping work:

```bash
npm run test:server   # Vitest bundled + live projects (Supertest)
npm run test:client   # React component/hook tests only
npm run test:live     # Live-mode server tests only (*.live.test.ts) — see live-mode-testing skill
```

**First-time E2E on a machine:** `npx playwright install chromium`

## Bundled mode constraints

- Bundled Vitest project forces `DATA_MODE=bundled` in `server/src/test/setup.ts` and clears `SPOONACULAR_API_KEY`.
- Live Vitest project uses `server/src/test/setup-live.ts` with mocked Spoonacular — no network.
- Stable fixture: recipe **1001** (Spaghetti Aglio e Olio) matches `pasta` + `garlic`.
- Use `pasta` for E2E search flows; use `gar` for autocomplete; use `unicorn-meat` for empty results.

## Architecture reference

```
server/src/app.ts          createApp() — used by Supertest (no listen())
server/vitest.config.ts    Two projects: bundled (*.test.ts) + live (*.live.test.ts)
server/src/test/setup.ts   Bundled env for default server tests
server/src/test/setup-live.ts  Live env + mock framework bootstrap
server/src/test/live/          Spoonacular mock, harness, re-exports
client/vitest.config.ts    jsdom; setupFiles → src/test/setup.ts
playwright.config.ts       E2E on ports 3011 (API) and 5183 (client)
e2e/bundled-mode.spec.ts   Full-app bundled flows (8 scenarios)
```

E2E starts its **own** dev servers with `DATA_MODE=bundled` on **3011/5183** so it does not conflict with normal dev on 3001/5173. Do not set `reuseExistingServer: true` for E2E unless you intentionally reuse dedicated test servers.

## Test inventory

| File | Covers |
|------|--------|
| `server/src/ingredientNormalize.test.ts` | Aliases, whole-word matching |
| `server/src/scoring.test.ts` | Match score, ingredient score, hard filters, taste profiles |
| `server/src/mappings.test.ts` | Complexity, summary strip, country of origin |
| `server/src/services/cache.test.ts` | Search/autocomplete cache keys and prefix reuse |
| `server/src/services/envFile.test.ts` | .env upsert with temp paths (mocked) |
| `server/src/services/bundledRecipes.test.ts` | Search/detail against real JSON |
| `server/src/services/recipeService.bundled.test.ts` | suggestIngredients, search cache |
| `server/src/routes/recipes.bundled.test.ts` | HTTP API via Supertest (bundled) |
| `server/src/routes/config.bundled.test.ts` | GET/PATCH config (mocked env write) |
| `server/src/services/recipeService.live.test.ts` | Live search/detail with mocks |
| `server/src/routes/config.live.test.ts` | Live HTTP config with spied env write |
| `client/src/utils/ingredientNormalize.test.ts` | Client alias + dedup |
| `client/src/api/recipes.test.ts` | fetch helpers, error propagation |
| `client/src/hooks/useRecipeSearch.test.ts` | Search hook + fetchDetail params |
| `client/src/components/IngredientInput.test.tsx` | Input + autocomplete UI |
| `client/src/components/SearchForm.test.tsx` | Submit disabled, onSearch payload |
| `client/src/components/RecipeCard.test.tsx` | Details available/unavailable, click |
| `client/src/components/ResultsList.test.tsx` | Empty, error, results states |
| `server/src/routes/recipes.live.test.ts` | Live HTTP routes, quota, autocomplete |
| `e2e/bundled-mode.spec.ts` | Badge, search, filters, empty, detail, autocomplete |

Live test conventions and framework API: [live-mode-testing](../live-mode-testing/SKILL.md).

## E2E selectors

UI tests rely on `data-testid` attributes. Preserve or update these when changing components:

| testid | Component |
|--------|-----------|
| `mode-badge` | App header offline/live badge |
| `ingredient-input` | Ingredient text field |
| `ingredient-suggestions` | Autocomplete dropdown |
| `search-submit` | Find Recipes button |
| `results-empty` | Pre-search prompt |
| `results-list` | Recipe grid after search |
| `results-error` | Search error state |
| `recipe-card-{id}` | Recipe card |
| `recipe-detail-title` | Detail modal title |
| `recipe-detail-instructions` | Detail modal instructions |

## Adding tests

**Server unit test:** pure logic in `server/src/**/*.test.ts`; use real `recipes.json` IDs (start at 1001).

**Server API test:** import `createApp()` from `server/src/app.ts`, use Supertest, assert `status.mode === 'bundled'` and `apiCallsToday === 0` where relevant.

**Live server test:** add `*.live.test.ts`; mock `../services/spoonacular.js`; never hit the network.

**Client test:** mock `fetch` with `vi.stubGlobal`; do not start the Express server.

**E2E test:** add scenarios to `e2e/bundled-mode.spec.ts`; wait for `/api/status` before assertions; use `waitForResponse` for search/autocomplete API calls.

## Failure triage

| Symptom | Likely cause |
|---------|----------------|
| E2E "Offline dataset" badge missing | Server not bundled; check Playwright `webServer` env |
| E2E browser executable missing | Run `npx playwright install chromium` |
| E2E port conflict | Another process on 3011/5183; E2E uses dedicated ports |
| bundledRecipes test fails on 1001 | `recipes.json` changed; update fixture IDs or ingredients |
| Client autocomplete test flaky | Ensure `@testing-library/react` cleanup in `client/src/test/setup.ts` |
| API test cache bleed | Call `clearSearchCache()` / `clearAutocompleteCache()` in `afterEach` |
| Live test quota bleed | Call `resetApiUsageForTests()` in live test hooks |

## Success criteria

Report integrity as **pass** only when:

1. `npm test` — all server (65) and client (20) tests green
2. `npm run build` — no compile errors
3. `npm run test:e2e` — all 8 bundled-mode browser tests green (when E2E is in scope)

If a step fails, fix the regression before considering the change complete. Summarize which layer failed (server unit, API, client, build, E2E) and the failing test name.
