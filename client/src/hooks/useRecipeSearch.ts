import { useCallback, useEffect, useState } from 'react';
import { searchRecipes, getRecipeDetail, fetchAppStatus } from '../api/recipes';
import type { AppStatus, RecipeDetail, RecipeSummary, SearchParams } from '../types/recipe';

export function useRecipeSearch() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastParams, setLastParams] = useState<SearchParams | null>(null);
  const [appStatus, setAppStatus] = useState<AppStatus | null>(null);

  useEffect(() => {
    fetchAppStatus()
      .then(setAppStatus)
      .catch(() => {});
  }, []);

  const search = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setLastParams(params);

    try {
      const { recipes: results, status } = await searchRecipes(params);
      setRecipes(results);
      if (status) setAppStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(
    async (id: number): Promise<RecipeDetail> => {
      const params = lastParams ?? {
        ingredients: [],
        diets: [],
        tasteProfiles: [],
      };
      const { recipe, status } = await getRecipeDetail(id, params);
      if (status) setAppStatus(status);
      return recipe;
    },
    [lastParams]
  );

  const refreshAppStatus = useCallback(async () => {
    try {
      const status = await fetchAppStatus();
      setAppStatus(status);
    } catch {
      // ignore
    }
  }, []);

  return {
    recipes,
    loading,
    error,
    hasSearched,
    appStatus,
    search,
    fetchDetail,
    refreshAppStatus,
  };
}
