---
name: live-mode-testing
description: >-
  Run and extend mock live-mode server tests for the Recipe Recommender. Use when
  changing live DATA_MODE paths, Spoonacular integration, API quota, config in
  live mode, or adding *.live.test.ts files. Never call the real Spoonacular API.
---

# Live Mode Testing (Mocked)

Test server behavior when `DATA_MODE=live` using the shared mock framework under `server/src/test/live/`. All live tests mock `spoonacular.ts` at the module boundary — **no network, no real API key**.

Related: [bundled-mode-testing](../bundled-mode-testing/SKILL.md) for offline tests and full integrity pipeline.

## When to run

Run live tests after changes to:

- `server/src/services/spoonacular.ts` or `recipeService.ts` live branches
- Quota tracking in `server/src/services/config.ts`
- Live-mode routes (`/api/recipes/*`, `/api/config` with `DATA_MODE=live`)
- `server/src/test/live/` framework or fixtures

## Commands

```bash
npm run test:live     # Live Vitest project only (9 tests)
npm run test:server   # Bundled + live projects (65 tests)
npm test              # Server + client (85 unit tests)
```

## Framework layout

```
server/src/test/
  setup-live.ts              Bootstrap: env, global hooks, Spoonacular mock
  fixtures/spoonacular.ts    mockLiveSummary, builders, mockIngredientMatches
  live/
    spoonacularMock.ts       vi.mock spoonacular + default quota-tracking behavior
    liveTestHarness.ts       applyLiveEnv, resetLiveTestState, exhaustQuota
    index.ts                 Public re-exports
```

### Automatic setup (via `setup-live.ts`)

Every `*.live.test.ts` file gets:

1. `DATA_MODE=live`, test API key, quota limit 50
2. Central `vi.mock` on `spoonacular.ts`
3. `beforeEach`: reset quota + caches + mock call history
4. Default mocks that call `trackApiCall()` and return fixtures

### Adding a live test

1. Create `server/src/**/*.live.test.ts` (picked up by Vitest `live` project only).
2. Do **not** add per-file `vi.mock` for Spoonacular — use `spoonacularMocks` from the framework.
3. Customize mocks when needed:

```typescript
import { describe, expect, it } from 'vitest';
import { spoonacularMocks } from '../test/live/index.js';
import { buildMockLiveSummary } from '../test/fixtures/spoonacular.js';
import { exhaustQuota } from '../test/live/liveTestHarness.js';
import { searchRecipes } from './recipeService.js';

describe('my live scenario', () => {
  it('returns custom mock data', async () => {
    spoonacularMocks.searchLiveRecipes.mockResolvedValueOnce([
      buildMockLiveSummary({ title: 'Custom' }),
    ]);
    const results = await searchRecipes({ ingredients: ['pasta'] });
    expect(results[0].title).toBe('Custom');
  });

  it('handles quota exhaustion', async () => {
    exhaustQuota();
    await expect(searchRecipes({ ingredients: ['pasta'] })).rejects.toThrow(/Daily API quota/);
  });
});
```

4. For config PATCH tests that touch disk, spy on `upsertEnvVars` (see `config.live.test.ts`) — setup loads `config.ts` before test-file `vi.mock` can apply.

## Test inventory

| File | Covers |
|------|--------|
| `server/src/services/recipeService.live.test.ts` | Live search, quota, detail vs bundled fallback (id >= 1000) |
| `server/src/routes/recipes.live.test.ts` | Live HTTP search, quota 500, sparse autocomplete |
| `server/src/routes/config.live.test.ts` | Live GET/PATCH config with spied `upsertEnvVars` |

## Conventions

| Rule | Detail |
|------|--------|
| File suffix | `*.live.test.ts` only |
| No network | Mock at `spoonacular.ts`, not `fetch` |
| State reset | Framework resets quota/caches/mocks each test — do not rely on order |
| Quota tests | `exhaustQuota()` or `applyLiveEnv({ DAILY_API_QUOTA: '0' })` |
| Config PATCH | Spy `upsertEnvVars`; avoid per-file `vi.mock` after setup loads config |
| Bundled fallback | Recipe ids `>= 1000` use bundled data even in live mode |

## Failure triage

| Symptom | Likely cause |
|---------|----------------|
| Mock not called | Wrong import path; real `spoonacular.ts` loaded instead of mock |
| Stale mock call count | Missing `resetSpoonacularMocks()` in hook (should be automatic via setup) |
| `upsertEnvVars` spy fails | Use `vi.spyOn(envFile, 'upsertEnvVars')` not `vi.mock` in live project |
| Quota test flaky | Prior test left `DAILY_API_QUOTA=0`; framework `applyLiveEnv()` in beforeEach should reset |

## Success criteria

Live work is complete when:

1. `npm run test:live` — all 9 live tests green
2. `npm test` — bundled + live + client still pass

For full app integrity after broader changes, also run `npm run build` and `npm run test:e2e` per the bundled-mode skill.
