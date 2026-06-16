import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Complexity } from '../types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface BundledRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  countryOfOrigin: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  complexity: Complexity;
  historySummary: string;
  summary: string;
  pantryIngredients: string[];
  ingredientList: { name: string; amount: number; unit: string; original: string }[];
  instructions: string[];
  sourceUrl: string;
}

let cachedRecipes: BundledRecipe[] | null = null;

export function loadBundledRecipes(): BundledRecipe[] {
  if (!cachedRecipes) {
    const filePath = path.join(__dirname, '../data/recipes.json');
    cachedRecipes = JSON.parse(readFileSync(filePath, 'utf-8')) as BundledRecipe[];
  }
  return cachedRecipes;
}

let cachedIngredients: string[] | null = null;

export function loadCommonIngredients(): string[] {
  if (!cachedIngredients) {
    const filePath = path.join(__dirname, '../data/common-ingredients.json');
    cachedIngredients = JSON.parse(readFileSync(filePath, 'utf-8')) as string[];
  }
  return cachedIngredients;
}
