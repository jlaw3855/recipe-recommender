import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { autocompleteIngredients } from '../api/recipes';
import { isIngredientAlreadyAdded, normalizeIngredient } from '../utils/ingredientNormalize';

interface IngredientInputProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
}

export default function IngredientInput({ ingredients, onChange }: IngredientInputProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const addIngredient = useCallback(
    (name: string) => {
      const canonical = normalizeIngredient(name);
      if (canonical && !isIngredientAlreadyAdded(canonical, ingredients)) {
        onChange([...ingredients, canonical]);
      }
      setInput('');
      setSuggestions([]);
      setShowSuggestions(false);
    },
    [ingredients, onChange]
  );

  const removeIngredient = (name: string) => {
    onChange(ingredients.filter((i) => i !== name));
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const results = await autocompleteIngredients(input);
      setSuggestions(
        results.filter((s) => !isIngredientAlreadyAdded(s, ingredients))
      );
      setShowSuggestions(true);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, ingredients]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient(input);
    } else if (e.key === 'Backspace' && !input && ingredients.length > 0) {
      onChange(ingredients.slice(0, -1));
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-sage-700 mb-2">
        Available Ingredients
      </label>

      <div className="flex flex-wrap gap-2 p-3 min-h-[48px] bg-white border border-sage-200 rounded-xl focus-within:ring-2 focus-within:ring-brand-400 focus-within:border-brand-400 transition-shadow">
        {ingredients.map((ing) => (
          <span
            key={ing}
            className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 text-brand-800 rounded-full text-sm font-medium"
          >
            {ing}
            <button
              type="button"
              onClick={() => removeIngredient(ing)}
              className="ml-0.5 text-brand-600 hover:text-brand-800 leading-none"
              aria-label={`Remove ${ing}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={ingredients.length === 0 ? 'Type an ingredient and press Enter…' : 'Add more…'}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder:text-sage-400"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-sage-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => addIngredient(s)}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-brand-50 transition-colors"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
