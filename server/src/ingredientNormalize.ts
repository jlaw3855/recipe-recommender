/**
 * Canonical ingredient names and matching helpers.
 * Ensures "egg"/"eggs" (and similar pairs) behave identically in search.
 */

/** Maps common plural or variant forms to a single canonical name. */
const INGREDIENT_ALIASES: Record<string, string> = {
  eggs: 'egg',
  potatoes: 'potato',
  onions: 'onion',
  tomatoes: 'tomato',
  carrots: 'carrot',
  mushrooms: 'mushroom',
  peppers: 'pepper',
  beans: 'bean',
  lentils: 'lentil',
  chickpeas: 'chickpea',
  noodles: 'noodle',
  tortillas: 'tortilla',
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Normalize an ingredient string to its canonical lowercase form. */
export function normalizeIngredient(name: string): string {
  const trimmed = name.trim().toLowerCase();
  return INGREDIENT_ALIASES[trimmed] ?? trimmed;
}

/** Deduplicate ingredients after normalization, preserving first-seen order. */
export function normalizeIngredientList(ingredients: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const ingredient of ingredients) {
    const canonical = normalizeIngredient(ingredient);
    if (!canonical || seen.has(canonical)) continue;
    seen.add(canonical);
    result.push(canonical);
  }

  return result;
}

/**
 * Return true when a user ingredient matches a recipe pantry ingredient.
 * Uses canonical forms and whole-word matching to avoid false positives
 * (e.g. "egg" must not match "eggplant").
 */
export function ingredientsMatch(userIngredient: string, pantryIngredient: string): boolean {
  const user = normalizeIngredient(userIngredient);
  const pantry = normalizeIngredient(pantryIngredient);

  if (!user || !pantry) return false;
  if (user === pantry) return true;

  const userPattern = new RegExp(`\\b${escapeRegex(user)}\\b`, 'i');
  const pantryPattern = new RegExp(`\\b${escapeRegex(pantry)}\\b`, 'i');

  return userPattern.test(pantry) || pantryPattern.test(user);
}
