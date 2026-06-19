import { describe, expect, it } from 'vitest';
import {
  ingredientsMatch,
  normalizeIngredient,
  normalizeIngredientList,
} from './ingredientNormalize.js';

describe('normalizeIngredient', () => {
  it('lowercases and trims input', () => {
    expect(normalizeIngredient('  Garlic  ')).toBe('garlic');
  });

  it('maps plural aliases to canonical forms', () => {
    expect(normalizeIngredient('eggs')).toBe('egg');
    expect(normalizeIngredient('tomatoes')).toBe('tomato');
  });
});

describe('normalizeIngredientList', () => {
  it('deduplicates after normalization', () => {
    expect(normalizeIngredientList(['egg', 'eggs', 'Garlic'])).toEqual(['egg', 'garlic']);
  });
});

describe('ingredientsMatch', () => {
  it('matches exact canonical ingredients', () => {
    expect(ingredientsMatch('garlic', 'garlic')).toBe(true);
    expect(ingredientsMatch('eggs', 'egg')).toBe(true);
  });

  it('does not match egg with eggplant', () => {
    expect(ingredientsMatch('egg', 'eggplant')).toBe(false);
  });

  it('matches whole-word substrings in compound pantry names', () => {
    expect(ingredientsMatch('pepper', 'bell pepper')).toBe(true);
  });
});
