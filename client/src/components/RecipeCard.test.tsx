import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import RecipeCard from './RecipeCard';
import type { RecipeSummary } from '../types/recipe';

const baseRecipe: RecipeSummary = {
  id: 1001,
  title: 'Spaghetti Aglio e Olio',
  image: 'https://example.com/pasta.jpg',
  readyInMinutes: 20,
  usedIngredientCount: 2,
  missedIngredientCount: 1,
  countryOfOrigin: 'Italy',
  cuisines: ['italian'],
  complexity: 'easy',
  historySummary: 'A classic Roman pasta dish.',
  matchScore: 85,
  detailsAvailable: true,
};

describe('RecipeCard', () => {
  it('shows country, time, and history when details are available', () => {
    render(<RecipeCard recipe={baseRecipe} onClick={vi.fn()} />);

    expect(screen.getByText(/Italy/)).toBeInTheDocument();
    expect(screen.getByText(/20 min/)).toBeInTheDocument();
    expect(screen.getByText(/classic Roman pasta/i)).toBeInTheDocument();
  });

  it('shows tap-for-details hint when details are unavailable', () => {
    render(
      <RecipeCard
        recipe={{ ...baseRecipe, detailsAvailable: false, historySummary: '' }}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText(/Tap for full details/i)).toBeInTheDocument();
  });

  it('invokes onClick when the card is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<RecipeCard recipe={baseRecipe} onClick={onClick} />);
    await user.click(screen.getByTestId('recipe-card-1001'));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
