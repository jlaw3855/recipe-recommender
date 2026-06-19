import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  autocompleteIngredients,
  getRecipeDetail,
  searchRecipes,
} from './recipes';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchRecipes', () => {
  it('propagates server error message on failure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Daily API quota reached' }), { status: 500 })
    );

    await expect(
      searchRecipes({ ingredients: ['pasta'], diets: [], tasteProfiles: [] })
    ).rejects.toThrow('Daily API quota reached');
  });
});

describe('getRecipeDetail', () => {
  it('builds query string with search filters', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ recipe: { id: 1001 } }), { status: 200 })
    );

    await getRecipeDetail(1001, {
      ingredients: ['pasta', 'garlic'],
      diets: ['vegetarian'],
      complexity: 'easy',
      maxReadyTime: 30,
      tasteProfiles: ['spicy'],
    });

    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain('ingredients=pasta%2Cgarlic');
    expect(url).toContain('complexity=easy');
    expect(url).toContain('maxReadyTime=30');
    expect(url).toContain('diets=vegetarian');
    expect(url).toContain('tasteProfiles=spicy');
  });
});

describe('autocompleteIngredients', () => {
  it('returns empty array without fetching when query is too short', async () => {
    const results = await autocompleteIngredients('a');
    expect(results).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});
