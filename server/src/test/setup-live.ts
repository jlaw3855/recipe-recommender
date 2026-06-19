import './live/spoonacularMock.js';
import { resetSpoonacularMocks } from './live/spoonacularMock.js';
import { applyLiveEnv, resetLiveTestState } from './live/liveTestHarness.js';
import { afterEach, beforeEach } from 'vitest';

applyLiveEnv();

beforeEach(() => {
  resetLiveTestState();
  applyLiveEnv();
  resetSpoonacularMocks();
});

afterEach(() => {
  resetLiveTestState();
});
