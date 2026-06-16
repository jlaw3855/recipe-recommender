import type { RecipeSummary, SearchRequest } from '../types.js';
import { normalizeIngredientList } from '../ingredientNormalize.js';

const searchCache = new Map<string, RecipeSummary[]>();

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
