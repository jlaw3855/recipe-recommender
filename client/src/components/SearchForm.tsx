import { useState, type FormEvent } from 'react';
import IngredientInput from './IngredientInput';
import TasteProfilePicker from './TasteProfilePicker';
import {
  COMPLEXITY_OPTIONS,
  DIET_OPTIONS,
  TIME_PRESETS,
  type Complexity,
  type Diet,
  type SearchParams,
  type TasteProfile,
} from '../types/recipe';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [diets, setDiets] = useState<Diet[]>([]);
  const [complexity, setComplexity] = useState<Complexity | undefined>(undefined);
  const [maxReadyTime, setMaxReadyTime] = useState<number | undefined>(45);
  const [tasteProfiles, setTasteProfiles] = useState<TasteProfile[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDiet = (diet: Diet) => {
    setDiets((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (ingredients.length === 0) return;

    onSearch({
      ingredients,
      diets,
      complexity,
      maxReadyTime,
      tasteProfiles,
    });
    setMobileOpen(false);
  };

  const formContent = (
    <>
      <IngredientInput ingredients={ingredients} onChange={setIngredients} />

      {/* Dietary preferences */}
      <div>
        <label className="block text-sm font-medium text-sage-700 mb-2">
          Dietary Preferences
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DIET_OPTIONS.map((diet) => (
            <label
              key={diet}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-sage-200 rounded-lg cursor-pointer hover:border-brand-300 transition-colors has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50"
            >
              <input
                type="checkbox"
                checked={diets.includes(diet)}
                onChange={() => toggleDiet(diet)}
                className="rounded border-sage-300 text-brand-500 focus:ring-brand-400"
              />
              <span className="text-sm capitalize">{diet}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Complexity */}
      <div>
        <label className="block text-sm font-medium text-sage-700 mb-2">
          Complexity Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {COMPLEXITY_OPTIONS.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => setComplexity(complexity === value ? undefined : value)}
              className={`px-3 py-3 rounded-xl text-left border transition-all ${
                complexity === value
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-sage-700 border-sage-200 hover:border-brand-300'
              }`}
            >
              <div className="text-sm font-semibold">{label}</div>
              <div
                className={`text-xs mt-0.5 ${
                  complexity === value ? 'text-brand-100' : 'text-sage-500'
                }`}
              >
                {description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Prep time */}
      <div>
        <label className="block text-sm font-medium text-sage-700 mb-2">
          Max Preparation Time
          {maxReadyTime && (
            <span className="ml-2 text-brand-600 font-semibold">{maxReadyTime} min</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {TIME_PRESETS.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setMaxReadyTime(maxReadyTime === time ? undefined : time)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                maxReadyTime === time
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-sage-700 border-sage-200 hover:border-brand-300'
              }`}
            >
              {time === 90 ? '90+ min' : `${time} min`}
            </button>
          ))}
        </div>
        <input
          type="range"
          min={15}
          max={120}
          step={5}
          value={maxReadyTime ?? 45}
          onChange={(e) => setMaxReadyTime(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
      </div>

      <TasteProfilePicker selected={tasteProfiles} onChange={setTasteProfiles} />

      <button
        type="submit"
        disabled={loading || ingredients.length === 0}
        data-testid="search-submit"
        className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:bg-sage-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
      >
        {loading ? 'Searching…' : 'Find Recipes'}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile filter toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-30 px-5 py-3 bg-brand-500 text-white font-semibold rounded-full shadow-lg hover:bg-brand-600 transition-colors"
      >
        {mobileOpen ? 'Close Filters' : 'Filters'}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-80 xl:w-96 shrink-0">
        <form onSubmit={handleSubmit} className="sticky top-6 space-y-6 p-6 bg-white rounded-2xl shadow-sm border border-sage-200">
          <h2 className="font-display text-xl font-bold text-sage-900">Search Filters</h2>
          {formContent}
        </form>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <form
            onSubmit={handleSubmit}
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto scrollbar-thin p-6 bg-white rounded-t-2xl space-y-6"
          >
            <h2 className="font-display text-xl font-bold text-sage-900">Search Filters</h2>
            {formContent}
          </form>
        </div>
      )}
    </>
  );
}
