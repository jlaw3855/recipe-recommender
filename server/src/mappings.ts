import type { Complexity, TasteProfile } from './types.js';

/** Maps Spoonacular cuisine tags to a display country name. */
export const CUISINE_TO_COUNTRY: Record<string, string> = {
  african: 'Africa',
  american: 'United States',
  british: 'United Kingdom',
  cajun: 'United States (Louisiana)',
  caribbean: 'Caribbean',
  chinese: 'China',
  'eastern european': 'Eastern Europe',
  european: 'Europe',
  french: 'France',
  german: 'Germany',
  greek: 'Greece',
  indian: 'India',
  irish: 'Ireland',
  italian: 'Italy',
  japanese: 'Japan',
  jewish: 'Israel',
  korean: 'Korea',
  'latin american': 'Latin America',
  mediterranean: 'Mediterranean',
  mexican: 'Mexico',
  'middle eastern': 'Middle East',
  nordic: 'Scandinavia',
  southern: 'United States (South)',
  spanish: 'Spain',
  thai: 'Thailand',
  vietnamese: 'Vietnam',
};

/** Taste profiles mapped to cuisines and dish types for scoring. */
export const TASTE_MAPPINGS: Record<
  TasteProfile,
  { cuisines: string[]; dishTypes: string[] }
> = {
  spicy: {
    cuisines: ['mexican', 'indian', 'thai', 'korean', 'cajun'],
    dishTypes: ['main course', 'soup'],
  },
  savory: {
    cuisines: ['italian', 'french', 'american', 'british'],
    dishTypes: ['main course', 'soup', 'side dish'],
  },
  sweet: {
    cuisines: ['american', 'french'],
    dishTypes: ['dessert', 'snack'],
  },
  tangy: {
    cuisines: ['mediterranean', 'middle eastern', 'greek', 'mexican'],
    dishTypes: ['salad', 'main course'],
  },
  mild: {
    cuisines: ['japanese', 'british', 'southern'],
    dishTypes: ['main course', 'side dish', 'soup'],
  },
  umami: {
    cuisines: ['japanese', 'chinese', 'korean', 'italian'],
    dishTypes: ['main course', 'soup'],
  },
};

export const DIET_OPTIONS = [
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
] as const;

export const TASTE_OPTIONS: TasteProfile[] = [
  'spicy',
  'savory',
  'sweet',
  'tangy',
  'mild',
  'umami',
];

export const TIME_PRESETS = [15, 30, 45, 60, 90] as const;

/** Derive complexity from ingredient count, steps, and prep time. */
export function deriveComplexity(
  ingredientCount: number,
  stepCount: number,
  readyInMinutes: number
): Complexity {
  if (ingredientCount <= 6 && stepCount <= 5 && readyInMinutes <= 30) {
    return 'easy';
  }
  if (ingredientCount <= 12 && stepCount <= 10 && readyInMinutes <= 60) {
    return 'medium';
  }
  return 'hard';
}

/** Strip HTML tags and truncate to a given number of sentences. */
export function stripAndTruncateSummary(html: string, maxSentences = 3): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return sentences.slice(0, maxSentences).join(' ').trim();
}

/** Resolve country of origin from cuisine list. */
export function getCountryOfOrigin(cuisines: string[]): string {
  if (cuisines.length === 0) return 'Unknown';
  const primary = cuisines[0].toLowerCase();
  return CUISINE_TO_COUNTRY[primary] ?? capitalizeWords(primary);
}

function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
