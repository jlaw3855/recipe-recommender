import { afterEach, describe, expect, it } from 'vitest';
import { clearAutocompleteCache, clearSearchCache } from './cache.js';
import { searchRecipes, suggestIngredients } from './recipeService.js';

afterEach(() => {
  clearSearchCache();
  clearAutocompleteCache();
});

describe('recipeService bundled mode', () => {
  it('suggestIngredients returns empty for single-character query', async () => {
    const results = await suggestIngredients('a');
    expect(results).toEqual([]);
  });

  it('suggestIngredients returns prefix-ranked suggestions for gar', async () => {
    const results = await suggestIngredients('gar');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase().startsWith('gar')).toBe(true);
  });

  it('searchRecipes returns consistent cached results on repeat', async () => {
    const request = { ingredients: ['pasta'] };
    const first = await searchRecipes(request);
    const second = await searchRecipes(request);

    expect(first.length).toBeGreaterThan(0);
    expect(second).toEqual(first);
  });
});
