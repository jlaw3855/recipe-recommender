import { TASTE_OPTIONS } from '../types/recipe';
import type { TasteProfile } from '../types/recipe';

interface TasteProfilePickerProps {
  selected: TasteProfile[];
  onChange: (profiles: TasteProfile[]) => void;
}

export default function TasteProfilePicker({ selected, onChange }: TasteProfilePickerProps) {
  const toggle = (profile: TasteProfile) => {
    if (selected.includes(profile)) {
      onChange(selected.filter((p) => p !== profile));
    } else {
      onChange([...selected, profile]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-sage-700 mb-2">Taste Profile</label>
      <div className="flex flex-wrap gap-2">
        {TASTE_OPTIONS.map(({ value, label, emoji }) => {
          const isSelected = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                isSelected
                  ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                  : 'bg-white text-sage-700 border-sage-200 hover:border-brand-300 hover:bg-brand-50'
              }`}
            >
              <span>{emoji}</span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
