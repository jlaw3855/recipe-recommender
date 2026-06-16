import { Router } from 'express';
import type { SearchRequest } from '../types.js';
import {
  getAppStatus,
  getRecipeDetail,
  searchRecipes,
  suggestIngredients,
} from '../services/recipeService.js';

const router = Router();

router.get('/status', (_req, res) => {
  res.json(getAppStatus());
});

router.post('/search', async (req, res) => {
  try {
    const body = req.body as SearchRequest;

    if (!body.ingredients?.length) {
      res.status(400).json({ error: 'At least one ingredient is required.' });
      return;
    }

    const recipes = await searchRecipes(body);
    res.json({ recipes, status: getAppStatus() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    res.status(500).json({ error: message });
  }
});

router.get('/autocomplete', (req, res) => {
  const query = String(req.query.q ?? '');
  const results = suggestIngredients(query);
  res.json({ results });
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid recipe ID' });
      return;
    }

    const ingredients = req.query.ingredients
      ? String(req.query.ingredients).split(',')
      : [];
    const diets = req.query.diets ? String(req.query.diets).split(',') : [];
    const complexity = req.query.complexity
      ? (String(req.query.complexity) as SearchRequest['complexity'])
      : undefined;
    const maxReadyTime = req.query.maxReadyTime
      ? parseInt(String(req.query.maxReadyTime), 10)
      : undefined;
    const tasteProfiles = req.query.tasteProfiles
      ? (String(req.query.tasteProfiles).split(',') as SearchRequest['tasteProfiles'])
      : [];

    const recipe = await getRecipeDetail(id, {
      ingredients,
      diets: diets as SearchRequest['diets'],
      complexity,
      maxReadyTime,
      tasteProfiles,
    });

    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }

    res.json({ recipe, status: getAppStatus() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch recipe';
    res.status(500).json({ error: message });
  }
});

export default router;
