import type { RecipeDetail, RecipeSummary, SearchRequest } from '../types.js';
import { normalizeIngredient, normalizeIngredientList } from '../ingredientNormalize.js';
import { buildSearchCacheKey, getCachedSearch, setCachedSearch } from './cache.js';
import { getBundledRecipeDetail, searchBundledRecipes } from './bundledRecipes.js';
import { loadBundledRecipes, loadCommonIngredients } from './bundledData.js';
import { getApiUsage, getDailyQuotaLimit, getDataMode } from './config.js';
import { getLiveRecipeDetail, searchLiveRecipes } from './spoonacular.js';

export function suggestIngredients(query: string): { name: string }[] {
  if (query.length < 2) return [];

  const lower = query.toLowerCase();
  const seen = new Set<string>();

  return loadCommonIngredients()
    .filter((name) => name.toLowerCase().includes(lower))
    .filter((name) => {
      const canonical = normalizeIngredient(name);
      if (seen.has(canonical)) return false;
      seen.add(canonical);
      return true;
    })
    .slice(0, 8)
    .map((name) => ({ name: normalizeIngredient(name) }));
}

function withNormalizedIngredients(request: SearchRequest): SearchRequest {
  return {
    ...request,
    ingredients: normalizeIngredientList(request.ingredients),
  };
}

export async function searchRecipes(request: SearchRequest): Promise<RecipeSummary[]> {
  const normalizedRequest = withNormalizedIngredients(request);
  const mode = getDataMode();
  const cacheKey = buildSearchCacheKey(normalizedRequest, mode);
  const cached = getCachedSearch(cacheKey);
  if (cached) return cached;

  let recipes: RecipeSummary[];

  if (mode === 'bundled') {
    recipes = searchBundledRecipes(normalizedRequest);
  } else {
    const usage = getApiUsage();
    const limit = getDailyQuotaLimit();
    if (usage.callsToday >= limit) {
      throw new Error(
        `Daily API quota reached (${limit} calls). Switch to DATA_MODE=bundled or try again tomorrow.`
      );
    }
    recipes = await searchLiveRecipes(normalizedRequest);
  }

  setCachedSearch(cacheKey, recipes);
  return recipes;
}

export async function getRecipeDetail(
  id: number,
  request: SearchRequest
): Promise<RecipeDetail | null> {
  const normalizedRequest = withNormalizedIngredients(request);
  const mode = getDataMode();

  if (mode === 'bundled' || id >= 1000) {
    return getBundledRecipeDetail(id, normalizedRequest);
  }

  const usage = getApiUsage();
  const limit = getDailyQuotaLimit();
  if (usage.callsToday >= limit) {
    throw new Error(
      `Daily API quota reached (${limit} calls). Switch to DATA_MODE=bundled or try again tomorrow.`
    );
  }

  return getLiveRecipeDetail(id, normalizedRequest);
}

export function getAppStatus() {
  const mode = getDataMode();
  const usage = getApiUsage();
  const limit = getDailyQuotaLimit();

  return {
    mode,
    apiCallsToday: usage.callsToday,
    dailyQuota: limit,
    quotaRemaining: Math.max(0, limit - usage.callsToday),
    bundledRecipeCount: loadBundledRecipes().length,
  };
}
