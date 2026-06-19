import type { RecipeDetail } from '../types/recipe';

interface RecipeDetailModalProps {
  recipe: RecipeDetail | null;
  loading: boolean;
  error?: string | null;
  onClose: () => void;
}

export default function RecipeDetailModal({
  recipe,
  loading,
  error,
  onClose,
}: RecipeDetailModalProps) {
  if (!recipe && !loading && !error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-sage-500">Loading recipe details…</div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-600 font-medium mb-2">Could not load recipe</p>
            <p className="text-sage-600 text-sm">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 text-sm bg-sage-100 hover:bg-sage-200 rounded-lg"
            >
              Close
            </button>
          </div>
        ) : recipe ? (
          <>
            <div className="relative">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-56 sm:h-64 object-cover"
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full text-sage-700 hover:bg-white shadow-md text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-brand-500 text-white rounded-full text-sm font-bold">
                {recipe.matchScore}% match
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2
                  className="font-display text-2xl sm:text-3xl font-bold text-sage-900"
                  data-testid="recipe-detail-title"
                >
                  {recipe.title}
                </h2>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-sm">
                    🌍 {recipe.countryOfOrigin}
                  </span>
                  <span className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-sm">
                    ⏱ {recipe.readyInMinutes} min
                  </span>
                  <span className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-sm capitalize">
                    {recipe.complexity}
                  </span>
                  <span className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-sm">
                    🍽 {recipe.servings} servings
                  </span>
                </div>
              </div>

              {/* History */}
              <section>
                <h3 className="font-display text-lg font-bold text-sage-900 mb-2">
                  History & Origin
                </h3>
                <p className="text-sage-600 leading-relaxed">{recipe.summary}</p>
              </section>

              {/* Diets & dish types */}
              {(recipe.diets.length > 0 || recipe.dishTypes.length > 0) && (
                <section className="flex flex-wrap gap-2">
                  {recipe.diets.map((d) => (
                    <span
                      key={d}
                      className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs capitalize"
                    >
                      {d}
                    </span>
                  ))}
                  {recipe.dishTypes.map((d) => (
                    <span
                      key={d}
                      className="px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-full text-xs capitalize"
                    >
                      {d}
                    </span>
                  ))}
                </section>
              )}

              {/* Ingredients */}
              <section>
                <h3 className="font-display text-lg font-bold text-sage-900 mb-3">
                  Ingredients
                </h3>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {recipe.ingredients.map((ing, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-sage-700 px-3 py-2 bg-sage-50 rounded-lg"
                    >
                      <span className="text-brand-500 mt-0.5">•</span>
                      {ing.original}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Instructions */}
              <section data-testid="recipe-detail-instructions">
                <h3 className="font-display text-lg font-bold text-sage-900 mb-3">
                  Instructions
                </h3>
                <ol className="space-y-4">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="shrink-0 w-8 h-8 flex items-center justify-center bg-brand-500 text-white rounded-full text-sm font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sage-700 leading-relaxed pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>

              {recipe.sourceUrl && (
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium text-sm"
                >
                  View original recipe →
                </a>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
