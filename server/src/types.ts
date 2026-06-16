export type Complexity = 'easy' | 'medium' | 'hard';

export type TasteProfile =
  | 'spicy'
  | 'savory'
  | 'sweet'
  | 'tangy'
  | 'mild'
  | 'umami';

export type Diet =
  | 'vegetarian'
  | 'vegan'
  | 'pescetarian'
  | 'gluten free'
  | 'dairy free'
  | 'ketogenic'
  | 'paleo'
  | 'whole30'
  | 'low fodmap'
  | 'primal';

export interface SearchRequest {
  ingredients: string[];
  diets?: Diet[];
  complexity?: Complexity;
  maxReadyTime?: number;
  tasteProfiles?: TasteProfile[];
}

export interface RecipeSummary {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  usedIngredientCount: number;
  missedIngredientCount: number;
  countryOfOrigin: string;
  cuisines: string[];
  complexity: Complexity;
  historySummary: string;
  matchScore: number;
  /** True when full metadata is available without opening details (bundled mode). */
  detailsAvailable: boolean;
}

export interface RecipeDetail extends RecipeSummary {
  summary: string;
  servings: number;
  diets: string[];
  dishTypes: string[];
  ingredients: { name: string; amount: number; unit: string; original: string }[];
  instructions: string[];
  sourceUrl: string;
}

export interface IngredientMatch {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: { name: string }[];
  usedIngredients: { name: string }[];
  likes: number;
}

export interface SpoonacularRecipeInfo {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  sourceUrl: string;
  extendedIngredients: {
    name: string;
    amount: number;
    unit: string;
    original: string;
  }[];
  analyzedInstructions: {
    steps: { step: string }[];
  }[];
}
