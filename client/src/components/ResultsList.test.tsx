import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ResultsList from './ResultsList';
import type { RecipeSummary } from '../types/recipe';

const mockRecipe: RecipeSummary = {
  id: 1001,
  title: 'Spaghetti Aglio e Olio',
  image: 'https://example.com/pasta.jpg',
  readyInMinutes: 20,
  usedIngredientCount: 2,
  missedIngredientCount: 4,
  countryOfOrigin: 'Italy',
  cuisines: ['italian'],
  complexity: 'easy',
  historySummary: 'A classic Roman pasta dish.',
  matchScore: 85,
  detailsAvailable: true,
};

describe('ResultsList', () => {
  it('shows the empty prompt before any search', () => {
    render(
      <ResultsList
        recipes={[]}
        loading={false}
        error={null}
        hasSearched={false}
        onRecipeClick={vi.fn()}
      />
    );

    expect(screen.getByTestId('results-empty')).toBeInTheDocument();
    expect(screen.getByText(/what's in your kitchen/i)).toBeInTheDocument();
  });

  it('shows an error message when search fails', () => {
    render(
      <ResultsList
        recipes={[]}
        loading={false}
        error="Daily API quota reached"
        hasSearched={true}
        onRecipeClick={vi.fn()}
      />
    );

    expect(screen.getByTestId('results-error')).toBeInTheDocument();
    expect(screen.getByText('Daily API quota reached')).toBeInTheDocument();
  });

  it('renders recipe cards after a successful search', () => {
    render(
      <ResultsList
        recipes={[mockRecipe]}
        loading={false}
        error={null}
        hasSearched={true}
        onRecipeClick={vi.fn()}
      />
    );

    expect(screen.getByTestId('results-list')).toBeInTheDocument();
    expect(screen.getByText('Spaghetti Aglio e Olio')).toBeInTheDocument();
  });
});
