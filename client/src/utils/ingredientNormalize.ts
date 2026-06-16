/** Client-side canonical ingredient normalization (mirrors server/src/ingredientNormalize.ts). */

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

export function normalizeIngredient(name: string): string {
  const trimmed = name.trim().toLowerCase();
  return INGREDIENT_ALIASES[trimmed] ?? trimmed;
}

export function isIngredientAlreadyAdded(name: string, existing: string[]): boolean {
  const canonical = normalizeIngredient(name);
  return existing.some((item) => normalizeIngredient(item) === canonical);
}
