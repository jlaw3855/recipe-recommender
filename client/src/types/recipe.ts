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

export interface SearchParams {
  ingredients: string[];
  diets: Diet[];
  complexity?: Complexity;
  maxReadyTime?: number;
  tasteProfiles: TasteProfile[];
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
  detailsAvailable: boolean;
}

export interface AppStatus {
  mode: 'bundled' | 'live';
  apiCallsToday: number;
  dailyQuota: number;
  quotaRemaining: number;
  bundledRecipeCount?: number;
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

export const DIET_OPTIONS: Diet[] = [
  'vegetarian',
  'vegan',
  'pescetarian',
  'gluten free',
  'dairy free',
  'ketogenic',
  'paleo',
  'whole30',
  'low fodmap',
  'primal',
];

export const TASTE_OPTIONS: { value: TasteProfile; label: string; emoji: string }[] = [
  { value: 'spicy', label: 'Spicy', emoji: '🌶️' },
  { value: 'savory', label: 'Savory', emoji: '🧂' },
  { value: 'sweet', label: 'Sweet', emoji: '🍯' },
  { value: 'tangy', label: 'Tangy', emoji: '🍋' },
  { value: 'mild', label: 'Mild', emoji: '🌿' },
  { value: 'umami', label: 'Umami-rich', emoji: '🍄' },
];

export const COMPLEXITY_OPTIONS: { value: Complexity; label: string; description: string }[] = [
  { value: 'easy', label: 'Easy', description: '≤6 ingredients, ≤30 min' },
  { value: 'medium', label: 'Medium', description: '≤12 ingredients, ≤60 min' },
  { value: 'hard', label: 'Hard', description: 'Complex recipes' },
];

export const TIME_PRESETS = [15, 30, 45, 60, 90] as const;
