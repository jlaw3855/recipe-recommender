import { renderHook, waitFor, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRecipeSearch } from './useRecipeSearch';

const mockRecipe = {
  id: 1001,
  title: 'Spaghetti Aglio e Olio',
  image: 'https://example.com/pasta.jpg',
  readyInMinutes: 20,
  usedIngredientCount: 2,
  missedIngredientCount: 4,
  countryOfOrigin: 'Italy',
  cuisines: ['italian'],
  complexity: 'easy' as const,
  historySummary: 'A classic Roman pasta dish.',
  matchScore: 85,
  detailsAvailable: true,
};

const mockStatus = {
  mode: 'bundled' as const,
  apiCallsToday: 0,
  dailyQuota: 50,
  quotaRemaining: 50,
  bundledRecipeCount: 150,
};

function mockFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  return vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    return Promise.resolve(handler(url, init));
  });
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    mockFetch((url) => {
      if (url.includes('/api/status')) {
        return new Response(JSON.stringify(mockStatus), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useRecipeSearch', () => {
  it('loads bundled app status on mount', async () => {
    const { result } = renderHook(() => useRecipeSearch());

    await waitFor(() => {
      expect(result.current.appStatus?.mode).toBe('bundled');
    });
  });

  it('search populates recipes and updates status', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch((url, init) => {
        if (url.includes('/api/status')) {
          return new Response(JSON.stringify(mockStatus), { status: 200 });
        }
        if (url.includes('/api/recipes/search') && init?.method === 'POST') {
          return new Response(
            JSON.stringify({ recipes: [mockRecipe], status: mockStatus }),
            { status: 200 }
          );
        }
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      })
    );

    const { result } = renderHook(() => useRecipeSearch());

    await act(async () => {
      await result.current.search({
        ingredients: ['pasta'],
        diets: [],
        tasteProfiles: [],
      });
    });

    expect(result.current.recipes).toHaveLength(1);
    expect(result.current.recipes[0].title).toBe('Spaghetti Aglio e Olio');
    expect(result.current.hasSearched).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('sets error state when search fails', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch((url, init) => {
        if (url.includes('/api/status')) {
          return new Response(JSON.stringify(mockStatus), { status: 200 });
        }
        if (url.includes('/api/recipes/search')) {
          return new Response(JSON.stringify({ error: 'Search failed' }), { status: 500 });
        }
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      })
    );

    const { result } = renderHook(() => useRecipeSearch());

    await act(async () => {
      await result.current.search({
        ingredients: ['pasta'],
        diets: [],
        tasteProfiles: [],
      });
    });

    expect(result.current.error).toBe('Search failed');
    expect(result.current.recipes).toHaveLength(0);
  });

  it('fetchDetail passes last search params to the detail URL', async () => {
    let detailUrl = '';

    vi.stubGlobal(
      'fetch',
      mockFetch((url, init) => {
        if (url.includes('/api/status')) {
          return new Response(JSON.stringify(mockStatus), { status: 200 });
        }
        if (url.includes('/api/recipes/search') && init?.method === 'POST') {
          return new Response(
            JSON.stringify({ recipes: [mockRecipe], status: mockStatus }),
            { status: 200 }
          );
        }
        if (url.includes('/api/recipes/1001')) {
          detailUrl = url;
          return new Response(
            JSON.stringify({
              recipe: { ...mockRecipe, instructions: ['Step 1'] },
              status: mockStatus,
            }),
            { status: 200 }
          );
        }
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      })
    );

    const { result } = renderHook(() => useRecipeSearch());

    await act(async () => {
      await result.current.search({
        ingredients: ['pasta', 'garlic'],
        diets: ['vegetarian'],
        complexity: 'easy',
        maxReadyTime: 30,
        tasteProfiles: ['spicy'],
      });
    });

    await act(async () => {
      await result.current.fetchDetail(1001);
    });

    expect(detailUrl).toContain('ingredients=pasta%2Cgarlic');
    expect(detailUrl).toContain('diets=vegetarian');
    expect(detailUrl).toContain('complexity=easy');
    expect(detailUrl).toContain('maxReadyTime=30');
    expect(detailUrl).toContain('tasteProfiles=spicy');
  });
});
