import type { RecipeSummary } from '../types/recipe';

interface RecipeCardProps {
  recipe: RecipeSummary;
  onClick: () => void;
}

const COMPLEXITY_COLORS = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const hasDetails = recipe.detailsAvailable;

  return (
    <article
      onClick={onClick}
      data-testid={`recipe-card-${recipe.id}`}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-sage-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-sm font-bold text-brand-600 shadow-sm">
          {recipe.matchScore}% match
        </div>
      </div>

      <div className="p-5 space-y-3">
        <h3 className="font-display text-lg font-bold text-sage-900 line-clamp-2 group-hover:text-brand-700 transition-colors">
          {recipe.title}
        </h3>

        <div className="flex flex-wrap gap-2 text-xs">
          {hasDetails && recipe.countryOfOrigin && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sage-100 text-sage-700 rounded-full">
              🌍 {recipe.countryOfOrigin}
            </span>
          )}
          {hasDetails && recipe.readyInMinutes > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sage-100 text-sage-700 rounded-full">
              ⏱ {recipe.readyInMinutes} min
            </span>
          )}
          {hasDetails && (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full capitalize ${COMPLEXITY_COLORS[recipe.complexity]}`}
            >
              {recipe.complexity}
            </span>
          )}
          {!hasDetails && (
            <span className="inline-flex items-center px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full">
              Tap for full details
            </span>
          )}
        </div>

        {hasDetails && recipe.historySummary ? (
          <p className="text-sm text-sage-600 line-clamp-3 leading-relaxed">
            {recipe.historySummary}
          </p>
        ) : (
          <p className="text-sm text-sage-500 italic leading-relaxed">
            Open this recipe to see prep time, origin, history, and instructions.
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-sage-100 text-xs text-sage-500">
          <span>
            Uses {recipe.usedIngredientCount} of your ingredients
          </span>
          {recipe.missedIngredientCount > 0 && (
            <span className="text-brand-600">
              +{recipe.missedIngredientCount} needed
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
