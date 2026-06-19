import type { IngredientMatch, RecipeDetail, RecipeSummary } from '../../types.js';

export const mockLiveSummary: RecipeSummary = {
  id: 42,
  title: 'Mock Live Pasta',
  image: 'https://example.com/mock.jpg',
  readyInMinutes: 25,
  usedIngredientCount: 2,
  missedIngredientCount: 1,
  countryOfOrigin: '',
  cuisines: [],
  complexity: 'medium',
  historySummary: '',
  matchScore: 75,
  detailsAvailable: false,
};

export const mockLiveDetail: RecipeDetail = {
  ...mockLiveSummary,
  detailsAvailable: true,
  countryOfOrigin: 'Italy',
  cuisines: ['italian'],
  complexity: 'easy',
  historySummary: 'A mock live recipe.',
  summary: 'Mock summary text.',
  servings: 4,
  diets: ['vegetarian'],
  dishTypes: ['main course'],
  ingredients: [{ name: 'pasta', amount: 200, unit: 'g', original: '200g pasta' }],
  instructions: ['Boil pasta.', 'Serve.'],
  sourceUrl: 'https://example.com/recipe',
};

export const mockIngredientMatches: IngredientMatch[] = [
  {
    id: 42,
    title: 'Mock Live Pasta',
    image: 'https://example.com/mock.jpg',
    usedIngredientCount: 2,
    missedIngredientCount: 1,
    missedIngredients: [{ name: 'garlic' }],
    usedIngredients: [{ name: 'pasta' }, { name: 'olive oil' }],
    likes: 10,
  },
];

export function buildMockLiveSummary(overrides: Partial<RecipeSummary> = {}): RecipeSummary {
  return { ...mockLiveSummary, ...overrides };
}

export function buildMockLiveDetail(overrides: Partial<RecipeDetail> = {}): RecipeDetail {
  return { ...mockLiveDetail, ...overrides };
}
