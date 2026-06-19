import { describe, expect, it } from 'vitest';
import { isIngredientAlreadyAdded, normalizeIngredient } from './ingredientNormalize';

describe('normalizeIngredient', () => {
  it('lowercases and trims input', () => {
    expect(normalizeIngredient('  Garlic  ')).toBe('garlic');
  });

  it('maps plural aliases to canonical forms', () => {
    expect(normalizeIngredient('eggs')).toBe('egg');
    expect(normalizeIngredient('tomatoes')).toBe('tomato');
  });
});

describe('isIngredientAlreadyAdded', () => {
  it('detects duplicates after normalization', () => {
    expect(isIngredientAlreadyAdded('eggs', ['egg'])).toBe(true);
    expect(isIngredientAlreadyAdded('Garlic', ['garlic'])).toBe(true);
    expect(isIngredientAlreadyAdded('onion', ['garlic'])).toBe(false);
  });
});
