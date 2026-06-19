import { describe, expect, it } from 'vitest';
import { spoonacularMocks } from '../test/live/index.js';
import { mockLiveDetail, mockLiveSummary } from '../test/fixtures/spoonacular.js';
import { exhaustQuota } from '../test/live/liveTestHarness.js';
import { getRecipeDetail, searchRecipes } from './recipeService.js';

describe('recipeService live mode', () => {
  it('searchRecipes returns mocked live summaries', async () => {
    const results = await searchRecipes({ ingredients: ['pasta'] });

    expect(results).toEqual([mockLiveSummary]);
    expect(spoonacularMocks.searchLiveRecipes).toHaveBeenCalledOnce();
  });

  it('searchRecipes throws when daily API quota is exceeded', async () => {
    exhaustQuota();

    await expect(searchRecipes({ ingredients: ['pasta'] })).rejects.toThrow(/Daily API quota/);
  });

  it('getRecipeDetail uses live path for ids below 1000', async () => {
    const detail = await getRecipeDetail(42, { ingredients: ['pasta'] });

    expect(detail?.title).toBe(mockLiveDetail.title);
    expect(spoonacularMocks.getLiveRecipeDetail).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ ingredients: ['pasta'] })
    );
  });

  it('getRecipeDetail uses bundled path for ids 1000 and above', async () => {
    const detail = await getRecipeDetail(1001, { ingredients: ['pasta', 'garlic'] });

    expect(detail?.id).toBe(1001);
    expect(spoonacularMocks.getLiveRecipeDetail).not.toHaveBeenCalled();
  });
});
