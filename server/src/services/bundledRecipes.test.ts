import { describe, expect, it } from 'vitest';
import { SEARCH_RESULT_LIMIT } from '../constants.js';
import { getBundledRecipeDetail, searchBundledRecipes } from './bundledRecipes.js';

describe('searchBundledRecipes', () => {
  it('returns recipe 1001 when searching with pasta and garlic', () => {
    const results = searchBundledRecipes({ ingredients: ['pasta', 'garlic'] });
    const match = results.find((r) => r.id === 1001);

    expect(match).toBeDefined();
    expect(match?.title).toBe('Spaghetti Aglio e Olio');
    expect(match?.detailsAvailable).toBe(true);
  });

  it('excludes recipes with no ingredient overlap', () => {
    const results = searchBundledRecipes({ ingredients: ['unicorn-meat'] });
    expect(results).toHaveLength(0);
  });

  it('applies vegetarian diet filter', () => {
    const all = searchBundledRecipes({ ingredients: ['chicken'] });
    const vegetarian = searchBundledRecipes({
      ingredients: ['chicken'],
      diets: ['vegetarian'],
    });

    expect(vegetarian.length).toBeLessThanOrEqual(all.length);
    for (const recipe of vegetarian) {
      expect(recipe.id).not.toBe(1002);
    }
  });

  it('sorts results by matchScore descending', () => {
    const results = searchBundledRecipes({ ingredients: ['pasta', 'garlic', 'olive oil'] });

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].matchScore).toBeGreaterThanOrEqual(results[i].matchScore);
    }
  });

  it('caps results at SEARCH_RESULT_LIMIT', () => {
    const results = searchBundledRecipes({ ingredients: ['salt'] });
    expect(results.length).toBeLessThanOrEqual(SEARCH_RESULT_LIMIT);
  });
});

describe('getBundledRecipeDetail', () => {
  it('returns full detail for recipe 1001', () => {
    const detail = getBundledRecipeDetail(1001, { ingredients: ['pasta', 'garlic'] });

    expect(detail).not.toBeNull();
    expect(detail?.title).toBe('Spaghetti Aglio e Olio');
    expect(detail?.instructions.length).toBeGreaterThan(0);
    expect(detail?.ingredients.length).toBeGreaterThan(0);
  });

  it('returns null for unknown id', () => {
    expect(getBundledRecipeDetail(99999, { ingredients: ['pasta'] })).toBeNull();
  });
});
