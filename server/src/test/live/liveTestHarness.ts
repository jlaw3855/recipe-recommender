import { beforeEach, afterEach } from 'vitest';
import { clearAutocompleteCache, clearSearchCache } from '../../services/cache.js';
import { resetApiUsageForTests } from '../../services/config.js';
import { applyDefaultSpoonacularMocks } from './spoonacularMock.js';

export const LIVE_TEST_ENV = {
  DATA_MODE: 'live',
  SPOONACULAR_API_KEY: 'test-key-for-unit-tests',
  DAILY_API_QUOTA: '50',
} as const;

export function applyLiveEnv(overrides: Record<string, string> = {}): void {
  for (const [key, value] of Object.entries({ ...LIVE_TEST_ENV, ...overrides })) {
    process.env[key] = value;
  }
}

export function resetLiveTestState(): void {
  resetApiUsageForTests();
  clearSearchCache();
  clearAutocompleteCache();
}

export function exhaustQuota(): void {
  process.env.DAILY_API_QUOTA = '0';
}

export function liveTestHooks(): { beforeEach: () => void; afterEach: () => void } {
  return {
    beforeEach: () => {
      resetLiveTestState();
      applyLiveEnv();
      applyDefaultSpoonacularMocks();
    },
    afterEach: () => {
      resetLiveTestState();
    },
  };
}

export function registerLiveTestHooks(): void {
  const hooks = liveTestHooks();
  beforeEach(hooks.beforeEach);
  afterEach(hooks.afterEach);
}
