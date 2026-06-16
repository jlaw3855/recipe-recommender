import type { Complexity, RecipeDetail, RecipeSummary, SearchRequest } from '../types.js';
import { SEARCH_RESULT_LIMIT } from '../constants.js';
import { ingredientsMatch, normalizeIngredientList } from '../ingredientNormalize.js';
import { computeMatchScore, passesHardFiltersGeneric } from '../scoring.js';
import { loadBundledRecipes, type BundledRecipe } from './bundledData.js';

// * Match user ingredients against a bundled recipe's pantry list.
function matchBundledRecipe(
  recipe: BundledRecipe,
  userIngredients: string[]
): { used: number; missed: number } {
  const normalizedUser = normalizeIngredientList(userIngredients);
  let used = 0;

  for (const pantry of recipe.pantryIngredients) {
    const matched = normalizedUser.some((user) => ingredientsMatch(user, pantry));
    if (matched) used++;
  }

  const missed = Math.max(0, recipe.pantryIngredients.length - used);
  return { used, missed };
}

function bundledToSummary(
  recipe: BundledRecipe,
  used: number,
  missed: number,
  request: SearchRequest
): RecipeSummary {
  const matchScore = computeMatchScore(
    {
      usedIngredientCount: used,
      missedIngredientCount: missed,
      readyInMinutes: recipe.readyInMinutes,
      complexity: recipe.complexity,
      cuisines: recipe.cuisines,
      dishTypes: recipe.dishTypes,
      diets: recipe.diets,
    },
    request
  );

  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    readyInMinutes: recipe.readyInMinutes,
    usedIngredientCount: used,
    missedIngredientCount: missed,
    countryOfOrigin: recipe.countryOfOrigin,
    cuisines: recipe.cuisines,
    complexity: recipe.complexity,
    historySummary: recipe.historySummary,
    matchScore,
    detailsAvailable: true,
  };
}

function bundledToDetail(
  recipe: BundledRecipe,
  used: number,
  missed: number,
  request: SearchRequest
): RecipeDetail {
  return {
    ...bundledToSummary(recipe, used, missed, request),
    summary: recipe.summary,
    servings: recipe.servings,
    diets: recipe.diets,
    dishTypes: recipe.dishTypes,
    ingredients: recipe.ingredientList,
    instructions: recipe.instructions,
    sourceUrl: recipe.sourceUrl,
  };
}

export function searchBundledRecipes(request: SearchRequest): RecipeSummary[] {
  const recipes = loadBundledRecipes();
  const results: RecipeSummary[] = [];

  for (const recipe of recipes) {
    const { used, missed } = matchBundledRecipe(recipe, request.ingredients);
    if (used === 0) continue;

    if (
      !passesHardFiltersGeneric(
        {
          readyInMinutes: recipe.readyInMinutes,
          complexity: recipe.complexity,
          diets: recipe.diets,
        },
        request
      )
    ) {
      continue;
    }

    results.push(bundledToSummary(recipe, used, missed, request));
  }

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, SEARCH_RESULT_LIMIT);
}

export function getBundledRecipeDetail(
  id: number,
  request: SearchRequest
): RecipeDetail | null {
  const recipe = loadBundledRecipes().find((r) => r.id === id);
  if (!recipe) return null;

  const { used, missed } = matchBundledRecipe(recipe, request.ingredients);
  return bundledToDetail(recipe, used, missed, request);
}
