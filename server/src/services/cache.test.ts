import { afterEach, describe, expect, it } from 'vitest';
import type { RecipeSummary } from '../types.js';
import {
  buildSearchCacheKey,
  clearAutocompleteCache,
  clearSearchCache,
  findPrefixCachedAutocomplete,
  getCachedAutocomplete,
  getCachedSearch,
  setCachedAutocomplete,
  setCachedSearch,
} from './cache.js';

const sampleRecipe: RecipeSummary = {
  id: 1001,
  title: 'Test',
  image: '',
  readyInMinutes: 20,
  usedIngredientCount: 1,
  missedIngredientCount: 0,
  countryOfOrigin: 'Italy',
  cuisines: ['italian'],
  complexity: 'easy',
  historySummary: '',
  matchScore: 80,
  detailsAvailable: true,
};

afterEach(() => {
  clearSearchCache();
  clearAutocompleteCache();
});

describe('buildSearchCacheKey', () => {
  it('ignores ingredient order and duplicates after normalization', () => {
    const a = buildSearchCacheKey(
      { ingredients: ['garlic', 'pasta', 'eggs'] },
      'bundled'
    );
    const b = buildSearchCacheKey(
      { ingredients: ['egg', 'pasta', 'garlic'] },
      'bundled'
    );
    expect(a).toBe(b);
  });

  it('includes mode and sorted filter fields', () => {
    const bundled = buildSearchCacheKey({ ingredients: ['pasta'] }, 'bundled');
    const live = buildSearchCacheKey({ ingredients: ['pasta'] }, 'live');
    expect(bundled).not.toBe(live);

    const withFilters = buildSearchCacheKey(
      {
        ingredients: ['pasta'],
        diets: ['vegan', 'vegetarian'],
        tasteProfiles: ['spicy', 'mild'],
        complexity: 'easy',
        maxReadyTime: 30,
      },
      'bundled'
    );
    expect(withFilters).toContain('"complexity":"easy"');
    expect(withFilters).toContain('"maxReadyTime":30');
  });
});

describe('search cache', () => {
  it('round-trips cached search results', () => {
    const key = buildSearchCacheKey({ ingredients: ['pasta'] }, 'bundled');
    setCachedSearch(key, [sampleRecipe]);
    expect(getCachedSearch(key)).toEqual([sampleRecipe]);
  });
});

describe('autocomplete cache', () => {
  it('normalizes case and whitespace for exact lookup', () => {
    setCachedAutocomplete('garlic', ['garlic']);
    expect(getCachedAutocomplete('  GARLIC  ')).toEqual(['garlic']);
  });

  it('reuses prefix cache when query is extended', () => {
    setCachedAutocomplete('ch', ['chicken', 'cheese', 'chickpea']);
    const results = findPrefixCachedAutocomplete('chi');
    expect(results).toEqual(['chicken', 'chickpea']);
  });
});
