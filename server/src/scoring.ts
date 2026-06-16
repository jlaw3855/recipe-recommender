import type { Complexity, SearchRequest, SpoonacularRecipeInfo, TasteProfile } from './types.js';
import { TASTE_MAPPINGS } from './mappings.js';

interface ScoringInput {
  usedIngredientCount: number;
  missedIngredientCount: number;
  readyInMinutes: number;
  complexity: Complexity;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
}

/** Compute a weighted match score from 0–100. */
export function computeMatchScore(
  recipe: ScoringInput,
  request: SearchRequest
): number {
  const ingredientScore = scoreIngredientMatch(
    recipe.usedIngredientCount,
    recipe.missedIngredientCount
  );
  const tasteScore = scoreTasteProfile(
    recipe.cuisines,
    recipe.dishTypes,
    request.tasteProfiles ?? []
  );
  const complexityScore = scoreComplexity(recipe.complexity, request.complexity);
  const timeScore = scoreTimeFit(recipe.readyInMinutes, request.maxReadyTime);
  const dietScore = scoreDietCompliance(recipe.diets, request.diets ?? []);

  return Math.round(
    ingredientScore * 0.4 +
      tasteScore * 0.2 +
      complexityScore * 0.15 +
      timeScore * 0.15 +
      dietScore * 0.1
  );
}

function scoreIngredientMatch(used: number, missed: number): number {
  const total = used + missed;
  if (total === 0) return 0;
  return (used / total) * 100;
}

function scoreTasteProfile(
  cuisines: string[],
  dishTypes: string[],
  profiles: TasteProfile[]
): number {
  if (profiles.length === 0) return 100;

  let matches = 0;
  let totalChecks = 0;

  for (const profile of profiles) {
    const mapping = TASTE_MAPPINGS[profile];
    totalChecks += 2;

    const cuisineMatch = cuisines.some((c) =>
      mapping.cuisines.includes(c.toLowerCase())
    );
    const dishMatch = dishTypes.some((d) =>
      mapping.dishTypes.includes(d.toLowerCase())
    );

    if (cuisineMatch) matches++;
    if (dishMatch) matches++;
  }

  return totalChecks > 0 ? (matches / totalChecks) * 100 : 100;
}

function scoreComplexity(
  recipeComplexity: Complexity,
  requested?: Complexity
): number {
  if (!requested) return 100;
  return recipeComplexity === requested ? 100 : 40;
}

function scoreTimeFit(readyInMinutes: number, maxReadyTime?: number): number {
  if (!maxReadyTime) return 100;
  if (readyInMinutes > maxReadyTime) return 0;
  // Prefer recipes that use a reasonable portion of the available time
  const ratio = readyInMinutes / maxReadyTime;
  return Math.max(50, ratio * 100);
}

function scoreDietCompliance(recipeDiets: string[], requestedDiets: string[]): number {
  if (requestedDiets.length === 0) return 100;

  const normalizedRecipe = recipeDiets.map((d) => d.toLowerCase());
  const matched = requestedDiets.filter((d) =>
    normalizedRecipe.includes(d.toLowerCase())
  );

  return (matched.length / requestedDiets.length) * 100;
}

/** Score based only on ingredient match ratio — used for lightweight live search. */
export function computeIngredientScore(used: number, missed: number): number {
  const total = used + missed;
  if (total === 0) return 0;
  return Math.round((used / total) * 100);
}

/** Generic hard filters for bundled recipes or enriched live results. */
export function passesHardFiltersGeneric(
  recipe: {
    readyInMinutes: number;
    complexity: Complexity;
    diets: string[];
  },
  request: SearchRequest
): boolean {
  if (request.maxReadyTime && recipe.readyInMinutes > request.maxReadyTime) {
    return false;
  }

  if (request.diets && request.diets.length > 0) {
    const recipeDiets = recipe.diets.map((d) => d.toLowerCase());
    const allMet = request.diets.every((d) => recipeDiets.includes(d.toLowerCase()));
    if (!allMet) return false;
  }

  if (request.complexity && recipe.complexity !== request.complexity) {
    return false;
  }

  return true;
}

/** Filter recipes that exceed max prep time or fail diet requirements. */
export function passesHardFilters(
  info: SpoonacularRecipeInfo,
  complexity: Complexity,
  request: SearchRequest
): boolean {
  return passesHardFiltersGeneric(
    {
      readyInMinutes: info.readyInMinutes,
      complexity,
      diets: info.diets,
    },
    request
  );
}
