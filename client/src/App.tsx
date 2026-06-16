import { useCallback, useState } from 'react';
import SearchForm from './components/SearchForm';
import ResultsList from './components/ResultsList';
import RecipeDetailModal from './components/RecipeDetail';
import DataModeSettings from './components/DataModeSettings';
import { useRecipeSearch } from './hooks/useRecipeSearch';
import type { RecipeDetail, SearchParams } from './types/recipe';

export default function App() {
  const { recipes, loading, error, hasSearched, appStatus, search, fetchDetail, refreshAppStatus } =
    useRecipeSearch();
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const handleSearch = useCallback(
    (params: SearchParams) => {
      setSelectedRecipe(null);
      setDetailError(null);
      search(params);
    },
    [search]
  );

  const handleRecipeClick = useCallback(
    async (id: number) => {
      setDetailLoading(true);
      setSelectedRecipe(null);
      setDetailError(null);

      try {
        const detail = await fetchDetail(id);
        setSelectedRecipe(detail);
      } catch (err) {
        setDetailError(err instanceof Error ? err.message : 'Failed to load recipe');
      } finally {
        setDetailLoading(false);
      }
    },
    [fetchDetail]
  );

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-sage-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-sage-900">
            Recipe Recommender
          </h1>
          <p className="mt-1 text-sage-600">
            Discover recipes from around the world based on what you have and what you love.
          </p>

          {appStatus && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`px-2.5 py-1 rounded-full font-medium ${
                  appStatus.mode === 'bundled'
                    ? 'bg-sage-100 text-sage-700'
                    : 'bg-brand-100 text-brand-800'
                }`}
              >
                {appStatus.mode === 'bundled' ? '📦 Offline dataset' : '🌐 Live API'}
              </span>
              {appStatus.mode === 'live' && (
                <span className="px-2.5 py-1 rounded-full bg-sage-100 text-sage-600">
                  API: {appStatus.apiCallsToday}/{appStatus.dailyQuota} calls today
                </span>
              )}
              {appStatus.mode === 'bundled' && appStatus.bundledRecipeCount && (
                <span className="px-2.5 py-1 rounded-full bg-sage-100 text-sage-600">
                  {appStatus.bundledRecipeCount} curated recipes · 0 API calls
                </span>
              )}
              <DataModeSettings onConfigSaved={refreshAppStatus} />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <SearchForm onSearch={handleSearch} loading={loading} />

          <section className="flex-1 min-w-0">
            <ResultsList
              recipes={recipes}
              loading={loading}
              error={error}
              hasSearched={hasSearched}
              onRecipeClick={handleRecipeClick}
            />
          </section>
        </div>
      </main>

      <RecipeDetailModal
        recipe={selectedRecipe}
        loading={detailLoading}
        error={detailError}
        onClose={() => {
          setSelectedRecipe(null);
          setDetailError(null);
        }}
      />
    </div>
  );
}
