import { describe, expect, it } from 'vitest';
import {
  computeIngredientScore,
  computeMatchScore,
  passesHardFiltersGeneric,
} from './scoring.js';
import type { SearchRequest } from './types.js';

describe('computeMatchScore', () => {
  it('weights ingredient match highest', () => {
    const base = {
      usedIngredientCount: 4,
      missedIngredientCount: 2,
      readyInMinutes: 30,
      complexity: 'medium' as const,
      cuisines: ['italian'],
      dishTypes: ['main course'],
      diets: ['vegetarian'],
    };

    const perfectIngredients = computeMatchScore(base, { ingredients: [] });
    const poorIngredients = computeMatchScore(
      { ...base, usedIngredientCount: 1, missedIngredientCount: 5 },
      { ingredients: [] }
    );

    expect(perfectIngredients).toBeGreaterThan(poorIngredients);
  });

  it('returns 100 ingredient score when all pantry items match', () => {
    const score = computeMatchScore(
      {
        usedIngredientCount: 3,
        missedIngredientCount: 0,
        readyInMinutes: 20,
        complexity: 'easy',
        cuisines: [],
        dishTypes: [],
        diets: [],
      },
      { ingredients: ['pasta'] }
    );

    expect(score).toBeGreaterThanOrEqual(40);
  });

  it('scores higher when taste profiles match cuisines', () => {
    const spicyMatch = computeMatchScore(
      {
        usedIngredientCount: 2,
        missedIngredientCount: 1,
        readyInMinutes: 30,
        complexity: 'medium',
        cuisines: ['mexican'],
        dishTypes: ['main course'],
        diets: [],
      },
      { ingredients: ['pepper'], tasteProfiles: ['spicy'] }
    );
    const spicyMiss = computeMatchScore(
      {
        usedIngredientCount: 2,
        missedIngredientCount: 1,
        readyInMinutes: 30,
        complexity: 'medium',
        cuisines: ['british'],
        dishTypes: ['main course'],
        diets: [],
      },
      { ingredients: ['pepper'], tasteProfiles: ['spicy'] }
    );
    expect(spicyMatch).toBeGreaterThan(spicyMiss);
  });
});

describe('computeIngredientScore', () => {
  it('returns 0 when there are no pantry ingredients', () => {
    expect(computeIngredientScore(0, 0)).toBe(0);
  });

  it('returns 100 when all pantry items are used', () => {
    expect(computeIngredientScore(3, 0)).toBe(100);
  });
});

describe('passesHardFiltersGeneric', () => {
  const recipe = {
    readyInMinutes: 30,
    complexity: 'easy' as const,
    diets: ['vegetarian'],
  };

  it('passes when no filters are set', () => {
    expect(passesHardFiltersGeneric(recipe, { ingredients: ['pasta'] })).toBe(true);
  });

  it('rejects recipes exceeding maxReadyTime', () => {
    const request: SearchRequest = { ingredients: ['pasta'], maxReadyTime: 20 };
    expect(passesHardFiltersGeneric(recipe, request)).toBe(false);
  });

  it('rejects recipes missing required diet', () => {
    const request: SearchRequest = { ingredients: ['pasta'], diets: ['vegan'] };
    expect(passesHardFiltersGeneric(recipe, request)).toBe(false);
  });

  it('rejects recipes with wrong complexity', () => {
    const request: SearchRequest = { ingredients: ['pasta'], complexity: 'hard' };
    expect(passesHardFiltersGeneric(recipe, request)).toBe(false);
  });

  it('passes when complexity matches the filter', () => {
    const request: SearchRequest = { ingredients: ['pasta'], complexity: 'easy' };
    expect(passesHardFiltersGeneric(recipe, request)).toBe(true);
  });
});
