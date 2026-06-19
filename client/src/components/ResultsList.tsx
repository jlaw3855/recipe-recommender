import RecipeCard from './RecipeCard';
import type { RecipeSummary } from '../types/recipe';

interface ResultsListProps {
  recipes: RecipeSummary[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  onRecipeClick: (id: number) => void;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-sage-200 animate-pulse">
      <div className="aspect-[4/3] bg-sage-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-sage-200 rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-6 bg-sage-200 rounded-full w-20" />
          <div className="h-6 bg-sage-200 rounded-full w-16" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-sage-200 rounded w-full" />
          <div className="h-3 bg-sage-200 rounded w-full" />
          <div className="h-3 bg-sage-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default function ResultsList({
  recipes,
  loading,
  error,
  hasSearched,
  onRecipeClick,
}: ResultsListProps) {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-6" data-testid="results-error">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="font-display text-xl font-bold text-sage-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-sage-600 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="text-center py-20 px-6" data-testid="results-empty">
        <div className="text-6xl mb-6">🍳</div>
        <h3 className="font-display text-2xl font-bold text-sage-900 mb-3">
          What&apos;s in your kitchen?
        </h3>
        <p className="text-sage-600 max-w-lg mx-auto leading-relaxed">
          Add the ingredients you have on hand, set your preferences, and we&apos;ll
          recommend recipes ranked by how well they match — complete with country of
          origin and a taste of their history.
        </p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="font-display text-xl font-bold text-sage-900 mb-2">
          No recipes found
        </h3>
        <p className="text-sage-600 max-w-md mx-auto">
          Try adding more ingredients, relaxing your filters, or increasing the max
          preparation time.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="results-list">
      <p className="text-sm text-sage-500 mb-4">
        {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found, sorted by match score
      </p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={() => onRecipeClick(recipe.id)}
          />
        ))}
      </div>
    </div>
  );
}
