import { vi } from 'vitest';
import { mockLiveDetail, mockLiveSummary } from '../fixtures/spoonacular.js';

const mocks = vi.hoisted(() => ({
  searchLiveRecipes: vi.fn(),
  getLiveRecipeDetail: vi.fn(),
  autocompleteLiveIngredients: vi.fn(),
}));

vi.mock('../../services/spoonacular.js', () => ({
  searchLiveRecipes: mocks.searchLiveRecipes,
  getLiveRecipeDetail: mocks.getLiveRecipeDetail,
  autocompleteLiveIngredients: mocks.autocompleteLiveIngredients,
}));

export const spoonacularMocks = mocks;

export function applyDefaultSpoonacularMocks(): void {
  spoonacularMocks.searchLiveRecipes.mockImplementation(async () => {
    const { trackApiCall } = await import('../../services/config.js');
    trackApiCall();
    return [mockLiveSummary];
  });
  spoonacularMocks.getLiveRecipeDetail.mockImplementation(async () => {
    const { trackApiCall } = await import('../../services/config.js');
    trackApiCall();
    return mockLiveDetail;
  });
  spoonacularMocks.autocompleteLiveIngredients.mockImplementation(async () => {
    const { trackApiCall } = await import('../../services/config.js');
    trackApiCall();
    return ['zucchini'];
  });
}

export function resetSpoonacularMocks(): void {
  vi.clearAllMocks();
  applyDefaultSpoonacularMocks();
}
