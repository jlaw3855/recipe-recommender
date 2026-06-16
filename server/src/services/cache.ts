import type { RecipeSummary, SearchRequest } from '../types.js';
import { normalizeIngredientList } from '../ingredientNormalize.js';

const searchCache = new Map<string, RecipeSummary[]>();

export const MIN_LOCAL_SUGGESTIONS = 3;
export const AUTOCOMPLETE_MAX = 8;

const autocompleteCache = new Map<string, string[]>();

export function buildSearchCacheKey(request: SearchRequest, mode: string): string {
  return JSON.stringify({
    mode,
    ingredients: normalizeIngredientList(request.ingredients).sort(),
    diets: [...(request.diets ?? [])].sort(),
    complexity: request.complexity ?? null,
    maxReadyTime: request.maxReadyTime ?? null,
    tasteProfiles: [...(request.tasteProfiles ?? [])].sort(),
  });
}

export function getCachedSearch(key: string): RecipeSummary[] | undefined {
  return searchCache.get(key);
}

export function setCachedSearch(key: string, recipes: RecipeSummary[]): void {
  searchCache.set(key, recipes);
}

export function clearSearchCache(): void {
  searchCache.clear();
}

export function getSearchCacheSize(): number {
  return searchCache.size;
}

export function getCachedAutocomplete(query: string): string[] | undefined {
  const key = query.toLowerCase().trim();
  return autocompleteCache.get(key);
}

/** Reuse a shorter cached query when the user extends their prefix (e.g. "chi" → "chick"). */
export function findPrefixCachedAutocomplete(query: string): string[] | undefined {
  const key = query.toLowerCase().trim();
  let bestResults: string[] | undefined;
  let bestPrefixLen = 0;

  for (const [cachedKey, results] of autocompleteCache) {
    if (
      cachedKey.length >= 2 &&
      cachedKey.length < key.length &&
      key.startsWith(cachedKey)
    ) {
      if (cachedKey.length > bestPrefixLen) {
        bestPrefixLen = cachedKey.length;
        bestResults = results;
      }
    }
  }

  if (!bestResults) return undefined;

  return bestResults.filter((name) => name.toLowerCase().startsWith(key));
}

export function setCachedAutocomplete(query: string, results: string[]): void {
  const key = query.toLowerCase().trim();
  autocompleteCache.set(key, results);
}

export function clearAutocompleteCache(): void {
  autocompleteCache.clear();
}
