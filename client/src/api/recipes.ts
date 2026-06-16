import type { AppStatus, RecipeDetail, RecipeSummary, SearchParams } from '../types/recipe';

function buildDetailQuery(params: SearchParams): string {
  const query = new URLSearchParams();
  if (params.ingredients.length > 0) {
    query.set('ingredients', params.ingredients.join(','));
  }
  if (params.diets.length > 0) {
    query.set('diets', params.diets.join(','));
  }
  if (params.complexity) {
    query.set('complexity', params.complexity);
  }
  if (params.maxReadyTime) {
    query.set('maxReadyTime', String(params.maxReadyTime));
  }
  if (params.tasteProfiles.length > 0) {
    query.set('tasteProfiles', params.tasteProfiles.join(','));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchAppStatus(): Promise<AppStatus> {
  const response = await fetch('/api/status', { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch app status');
  return response.json();
}

export async function searchRecipes(
  params: SearchParams
): Promise<{ recipes: RecipeSummary[]; status?: AppStatus }> {
  const response = await fetch('/api/recipes/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    cache: 'no-store',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to search recipes');
  }

  return response.json();
}

export async function getRecipeDetail(
  id: number,
  params: SearchParams
): Promise<{ recipe: RecipeDetail; status?: AppStatus }> {
  const response = await fetch(`/api/recipes/${id}${buildDetailQuery(params)}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to fetch recipe details');
  }

  return response.json();
}

export async function autocompleteIngredients(query: string): Promise<string[]> {
  if (query.length < 2) return [];

  const response = await fetch(
    `/api/recipes/autocomplete?q=${encodeURIComponent(query)}`,
    { cache: 'no-store' }
  );
  if (!response.ok) return [];

  const data = await response.json();
  return data.results.map((r: { name: string }) => r.name);
}
