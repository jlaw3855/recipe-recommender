import type { RecipeDetail, RecipeSummary, SearchRequest } from '../types.js';
import { normalizeIngredient, normalizeIngredientList } from '../ingredientNormalize.js';
import {
  AUTOCOMPLETE_MAX,
  buildSearchCacheKey,
  findPrefixCachedAutocomplete,
  getCachedAutocomplete,
  getCachedSearch,
  MIN_LOCAL_SUGGESTIONS,
  setCachedAutocomplete,
  setCachedSearch,
} from './cache.js';
import { getBundledRecipeDetail, searchBundledRecipes } from './bundledRecipes.js';
import { loadBundledRecipes, loadCommonIngredients } from './bundledData.js';
import { getApiUsage, getDailyQuotaLimit, getDataMode } from './config.js';
import { autocompleteLiveIngredients, getLiveRecipeDetail, searchLiveRecipes } from './spoonacular.js';

function searchLocalIngredients(query: string): string[] {
  const lower = query.toLowerCase();
  const seen = new Set<string>();
  const prefixMatches: string[] = [];
  const substringMatches: string[] = [];

  for (const name of loadCommonIngredients()) {
    const nameLower = name.toLowerCase();
    if (!nameLower.includes(lower)) continue;

    const canonical = normalizeIngredient(name);
    if (seen.has(canonical)) continue;
    seen.add(canonical);

    if (nameLower.startsWith(lower)) {
      prefixMatches.push(canonical);
    } else {
      substringMatches.push(canonical);
    }
  }

  return [...prefixMatches, ...substringMatches].slice(0, AUTOCOMPLETE_MAX);
}

function mergeAndRankSuggestions(
  query: string,
  local: string[],
  remote: string[]
): string[] {
  const seen = new Set<string>();
  const prefixMatches: string[] = [];
  const otherMatches: string[] = [];

  const add = (name: string) => {
    const canonical = normalizeIngredient(name);
    if (seen.has(canonical)) return;
    seen.add(canonical);

    const lower = canonical.toLowerCase();
    if (lower.startsWith(query)) {
      prefixMatches.push(canonical);
    } else {
      otherMatches.push(canonical);
    }
  };

  for (const name of local) add(name);
  for (const name of remote) add(name);

  return [...prefixMatches, ...otherMatches].slice(0, AUTOCOMPLETE_MAX);
}

function toSuggestionResults(names: string[]): { name: string }[] {
  return names.map((name) => ({ name }));
}

export async function suggestIngredients(query: string): Promise<{ name: string }[]> {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return [];

  const mode = getDataMode();

  if (mode === 'bundled') {
    return toSuggestionResults(searchLocalIngredients(normalized));
  }

  const exactCached = getCachedAutocomplete(normalized);
  if (exactCached) {
    return toSuggestionResults(exactCached.slice(0, AUTOCOMPLETE_MAX));
  }

  const prefixCached = findPrefixCachedAutocomplete(normalized);
  if (prefixCached && prefixCached.length > 0) {
    const results = prefixCached.slice(0, AUTOCOMPLETE_MAX);
    setCachedAutocomplete(normalized, results);
    return toSuggestionResults(results);
  }

  const localResults = searchLocalIngredients(normalized);

  if (localResults.length >= MIN_LOCAL_SUGGESTIONS) {
    setCachedAutocomplete(normalized, localResults);
    return toSuggestionResults(localResults);
  }

  const usage = getApiUsage();
  const limit = getDailyQuotaLimit();
  if (usage.callsToday >= limit) {
    setCachedAutocomplete(normalized, localResults);
    return toSuggestionResults(localResults);
  }

  try {
    const remoteResults = await autocompleteLiveIngredients(normalized);
    const merged = mergeAndRankSuggestions(normalized, localResults, remoteResults);
    setCachedAutocomplete(normalized, merged);
    return toSuggestionResults(merged);
  } catch {
    setCachedAutocomplete(normalized, localResults);
    return toSuggestionResults(localResults);
  }
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
