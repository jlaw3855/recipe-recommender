/**
 * One-off script to expand recipes.json from 30 to 150 entries.
 * Run: node server/scripts/generate-recipes.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const recipesPath = path.join(__dirname, '../src/data/recipes.json');

const existing = JSON.parse(readFileSync(recipesPath, 'utf-8'));

const COUNTRIES = [
  { country: 'Italy', cuisines: ['italian'], dishes: ['main course', 'pasta'] },
  { country: 'China', cuisines: ['chinese'], dishes: ['main course', 'soup'] },
  { country: 'Mexico', cuisines: ['mexican'], dishes: ['main course', 'side dish'] },
  { country: 'India', cuisines: ['indian'], dishes: ['main course', 'soup'] },
  { country: 'Japan', cuisines: ['japanese'], dishes: ['main course', 'soup'] },
  { country: 'Thailand', cuisines: ['thai'], dishes: ['main course', 'soup'] },
  { country: 'France', cuisines: ['french'], dishes: ['main course', 'dessert'] },
  { country: 'Greece', cuisines: ['greek', 'mediterranean'], dishes: ['salad', 'main course'] },
  { country: 'United States', cuisines: ['american'], dishes: ['main course', 'breakfast'] },
  { country: 'Spain', cuisines: ['spanish'], dishes: ['main course', 'appetizer'] },
  { country: 'Korea', cuisines: ['korean'], dishes: ['main course', 'side dish'] },
  { country: 'Vietnam', cuisines: ['vietnamese'], dishes: ['main course', 'soup'] },
  { country: 'Middle East', cuisines: ['middle eastern'], dishes: ['main course', 'appetizer'] },
  { country: 'United Kingdom', cuisines: ['british'], dishes: ['main course', 'soup'] },
  { country: 'Latin America', cuisines: ['latin american'], dishes: ['main course', 'side dish'] },
];

const PROTEINS = [
  { name: 'chicken', diets: ['gluten free'] },
  { name: 'beef', diets: ['gluten free'] },
  { name: 'pork', diets: ['gluten free'] },
  { name: 'salmon', diets: ['gluten free', 'pescetarian'] },
  { name: 'shrimp', diets: ['gluten free', 'pescetarian'] },
  { name: 'tofu', diets: ['vegetarian', 'vegan', 'gluten free'] },
  { name: 'lentils', diets: ['vegetarian', 'vegan', 'gluten free'] },
  { name: 'chickpeas', diets: ['vegetarian', 'vegan', 'gluten free'] },
  { name: 'egg', diets: ['vegetarian', 'gluten free'] },
  { name: 'black beans', diets: ['vegetarian', 'vegan', 'gluten free'] },
];

const VEG = ['onion', 'garlic', 'tomato', 'bell pepper', 'carrot', 'spinach', 'broccoli', 'potato', 'mushroom', 'zucchini', 'cabbage', 'celery', 'corn', 'peas', 'ginger', 'cilantro', 'lemon', 'lime'];
const STARCH = ['rice', 'pasta', 'noodles', 'bread', 'potato', 'quinoa', 'couscous', 'tortilla'];
const SEASON = ['olive oil', 'soy sauce', 'cumin', 'paprika', 'basil', 'oregano', 'butter', 'cream', 'coconut milk', 'cheese'];

const TITLES = [
  'Braised', 'Grilled', 'Roasted', 'Pan-Seared', 'Slow-Cooked', 'Spicy', 'Herbed', 'Classic',
  'Homestyle', 'Rustic', 'Garden', 'Hearty', 'Light', 'Savory', 'Aromatic', 'Golden',
];
const FORMS = ['Bowl', 'Skillet', 'Stew', 'Curry', 'Soup', 'Salad', 'Plate', 'Wrap', 'Bake', 'Risotto'];

const IMAGES = [
  'photo-1546069901-ba9599a7e63c', 'photo-1565299624946-b28f40a0ae38', 'photo-1565958011703-44f9829ba187',
  'photo-1504674900247-0877df9cc836', 'photo-1482049010485-2c788e638279', 'photo-1512621776951-a57141f2eefd',
  'photo-1498837167922-ddd275275608', 'photo-1476224207961-aa3fcd36e148', 'photo-1467003909585-2f8a72700288',
  'photo-1555939594-58d7cb561ad1', 'photo-1563379091339-03b21ab4a4f8', 'photo-1600803907087-f56d135df9f3',
  'photo-1606491956689-2ea866858f14', 'photo-1617093727343-374698b813c6', 'photo-1625944525533-473f2a6dd271',
];

function pick(arr, i) {
  return arr[i % arr.length];
}

function pickN(arr, count, seed) {
  const out = [];
  for (let j = 0; j < count; j++) {
    out.push(arr[(seed + j * 7) % arr.length]);
  }
  return [...new Set(out)];
}

function complexityFor(i) {
  if (i % 3 === 0) return 'easy';
  if (i % 3 === 1) return 'medium';
  return 'hard';
}

function minutesFor(complexity, index) {
  if (complexity === 'easy') return 15 + (index % 20);
  if (complexity === 'medium') return 35 + (index % 25);
  return 55 + (index % 35);
}

function generateRecipe(id, index) {
  const region = pick(COUNTRIES, index);
  const protein = pick(PROTEINS, index);
  const veg = pickN(VEG, 3, index);
  const starch = pick(STARCH, index);
  const season = pickN(SEASON, 2, index + 3);
  const pantry = [protein.name, starch, ...veg, ...season].slice(0, 6 + (index % 4));
  const complexity = complexityFor(index);
  const readyInMinutes = minutesFor(complexity, index);
  const title = `${pick(TITLES, index)} ${protein.name.charAt(0).toUpperCase() + protein.name.slice(1)} ${pick(FORMS, index + 5)}`;
  const cuisine = region.cuisines[0];
  const dishType = region.dishes[index % region.dishes.length];

  const diets = [...new Set([...protein.diets, ...(index % 5 === 0 ? ['dairy free'] : [])])];

  const historySummary = `A ${cuisine} ${dishType} built around ${protein.name} and ${starch}, reflecting regional home-cooking traditions.`;
  const summary = `${title} draws on ${region.country}'s culinary heritage, combining ${pantry.slice(0, 3).join(', ')} with local spices and techniques passed down through generations. Home cooks across ${region.country} prepare variations of this dish for weeknight meals and family gatherings. It showcases how simple pantry ingredients can become a satisfying, culturally rooted meal.`;

  const ingredientList = pantry.slice(0, 5).map((name, j) => ({
    name,
    amount: j + 1,
    unit: j === 0 ? 'lb' : 'cup',
    original: `${j + 1} ${j === 0 ? 'lb' : 'cup'} ${name}`,
  }));

  const instructions = [
    `Prep all ingredients: chop ${veg[0]} and ${veg[1]}, measure ${season[0]}.`,
    `Cook ${protein.name} with ${season[0]} over medium-high heat until done.`,
    `Add ${veg.join(', ')} and ${starch}; simmer until tender, about ${Math.floor(readyInMinutes / 3)} minutes.`,
    `Season to taste and serve hot, garnished with fresh herbs if available.`,
  ];

  return {
    id,
    title,
    image: `https://images.unsplash.com/${pick(IMAGES, index)}?w=600`,
    readyInMinutes,
    servings: 2 + (index % 5),
    countryOfOrigin: region.country,
    cuisines: region.cuisines,
    dishTypes: [dishType],
    diets,
    complexity,
    historySummary,
    summary,
    pantryIngredients: pantry,
    ingredientList,
    instructions,
    sourceUrl: '',
  };
}

const startId = 1031;
const needed = 150 - existing.length;
const newRecipes = [];

for (let i = 0; i < needed; i++) {
  newRecipes.push(generateRecipe(startId + i, i + 30));
}

const merged = [...existing, ...newRecipes];
writeFileSync(recipesPath, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
console.log(`Wrote ${merged.length} recipes (${existing.length} existing + ${newRecipes.length} new)`);
