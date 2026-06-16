import { SEARCH_RESULT_LIMIT } from '../constants.js';
import { ingredientsMatch, normalizeIngredientList } from '../ingredientNormalize.js';
import type {
  IngredientMatch,
  RecipeDetail,
  RecipeSummary,
  SearchRequest,
  SpoonacularRecipeInfo,
} from '../types.js';
import {
  deriveComplexity,
  getCountryOfOrigin,
  stripAndTruncateSummary,
} from '../mappings.js';
import {
  computeIngredientScore,
  computeMatchScore,
} from '../scoring.js';
import { AUTOCOMPLETE_MAX } from './cache.js';
import { trackApiCall } from './config.js';

interface SpoonacularAutocompleteItem {
  name: string;
  image?: string;
  id?: number;
}

const BASE_URL = 'https://api.spoonacular.com';

/** In-memory cache for recipe details to reduce API quota usage. */
const recipeCache = new Map<number, SpoonacularRecipeInfo>();

function getApiKey(): string {
  const key = process.env.SPOONACULAR_API_KEY;
  if (!key || key === 'your_api_key_here') {
    throw new Error(
      'SPOONACULAR_API_KEY is not configured. Copy .env.example to .env and add your key, or set DATA_MODE=bundled.'
    );
  }
  return key;
}

async function spoonacularFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  trackApiCall();
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('apiKey', getApiKey());
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Spoonacular API error (${response.status}): ${body}`);
  }
  return response.json() as Promise<T>;
}

export async function autocompleteLiveIngredients(query: string): Promise<string[]> {
  const items = await spoonacularFetch<SpoonacularAutocompleteItem[]>(
    '/food/ingredients/autocomplete',
    { query, number: String(AUTOCOMPLETE_MAX) }
  );
  return items.map((item) => item.name);
}

export async function findByIngredients(ingredients: string[]): Promise<IngredientMatch[]> {
  return spoonacularFetch<IngredientMatch[]>('/recipes/findByIngredients', {
    ingredients: ingredients.join(','),
    number: '20',
    ranking: '2',
    ignorePantry: 'true',
  });
}

export async function getRecipeInformation(id: number): Promise<SpoonacularRecipeInfo> {
  if (recipeCache.has(id)) {
    return recipeCache.get(id)!;
  }

  const info = await spoonacularFetch<SpoonacularRecipeInfo>(
    `/recipes/${id}/information`,
    { includeNutrition: 'false' }
  );
  recipeCache.set(id, info);
  return info;
}

function getStepCount(info: SpoonacularRecipeInfo): number {
  return info.analyzedInstructions.reduce(
    (sum, section) => sum + section.steps.length,
    0
  );
}

function matchToLightSummary(match: IngredientMatch): RecipeSummary {
  return {
    id: match.id,
    title: match.title,
    image: match.image,
    readyInMinutes: 0,
    usedIngredientCount: match.usedIngredientCount,
    missedIngredientCount: match.missedIngredientCount,
    countryOfOrigin: '',
    cuisines: [],
    complexity: 'medium',
    historySummary: '',
    matchScore: computeIngredientScore(match.usedIngredientCount, match.missedIngredientCount),
    detailsAvailable: false,
  };
}

function toRecipeSummary(
  match: IngredientMatch,
  info: SpoonacularRecipeInfo,
  request: SearchRequest
): RecipeSummary {
  const stepCount = getStepCount(info);
  const ingredientCount = info.extendedIngredients.length;
  const complexity = deriveComplexity(ingredientCount, stepCount, info.readyInMinutes);

  const matchScore = computeMatchScore(
    {
      usedIngredientCount: match.usedIngredientCount,
      missedIngredientCount: match.missedIngredientCount,
      readyInMinutes: info.readyInMinutes,
      complexity,
      cuisines: info.cuisines,
      dishTypes: info.dishTypes,
      diets: info.diets,
    },
    request
  );

  return {
    id: info.id,
    title: info.title,
    image: info.image,
    readyInMinutes: info.readyInMinutes,
    usedIngredientCount: match.usedIngredientCount,
    missedIngredientCount: match.missedIngredientCount,
    countryOfOrigin: getCountryOfOrigin(info.cuisines),
    cuisines: info.cuisines,
    complexity,
    historySummary: stripAndTruncateSummary(info.summary),
    matchScore,
    detailsAvailable: true,
  };
}

function toRecipeDetail(
  match: IngredientMatch,
  info: SpoonacularRecipeInfo,
  request: SearchRequest
): RecipeDetail {
  const summary = toRecipeSummary(match, info, request);
  const instructions = info.analyzedInstructions.flatMap((section) =>
    section.steps.map((s) => s.step)
  );

  return {
    ...summary,
    summary: info.summary.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
    servings: info.servings,
    diets: info.diets,
    dishTypes: info.dishTypes,
    ingredients: info.extendedIngredients.map((ing) => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      original: ing.original,
    })),
    instructions,
    sourceUrl: info.sourceUrl,
  };
}

/** Lightweight search: one API call, no detail fetches. Results ranked by ingredient match. */
export async function searchLiveRecipes(request: SearchRequest): Promise<RecipeSummary[]> {
  if (!request.ingredients || request.ingredients.length === 0) {
    throw new Error('At least one ingredient is required.');
  }

  const matches = await findByIngredients(request.ingredients);
  if (matches.length === 0) return [];

  return matches
    .map((match) => matchToLightSummary(match))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, SEARCH_RESULT_LIMIT);
}

export async function getLiveRecipeDetail(
  id: number,
  request: SearchRequest
): Promise<RecipeDetail | null> {
  const info = await getRecipeInformation(id);

  const normalizedUser = normalizeIngredientList(request.ingredients);
  let used = 0;
  for (const ing of info.extendedIngredients) {
    if (normalizedUser.some((user) => ingredientsMatch(user, ing.name))) {
      used++;
    }
  }

  const match: IngredientMatch = {
    id: info.id,
    title: info.title,
    image: info.image,
    usedIngredientCount: used,
    missedIngredientCount: Math.max(0, info.extendedIngredients.length - used),
    missedIngredients: [],
    usedIngredients: [],
    likes: 0,
  };

  return toRecipeDetail(match, info, request);
}
