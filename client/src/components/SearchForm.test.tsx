import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SearchForm from './SearchForm';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width: 1024px'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ results: [] }), { status: 200 }))
    )
  );
});

describe('SearchForm', () => {
  it('disables submit when no ingredients are added', () => {
    render(<SearchForm onSearch={vi.fn()} loading={false} />);
    expect(screen.getByTestId('search-submit')).toBeDisabled();
  });

  it('calls onSearch with ingredients and default filters after submit', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchForm onSearch={onSearch} loading={false} />);

    await user.type(screen.getByTestId('ingredient-input'), 'pasta{Enter}');
    await user.click(screen.getByTestId('search-submit'));

    expect(onSearch).toHaveBeenCalledWith({
      ingredients: ['pasta'],
      diets: [],
      complexity: undefined,
      maxReadyTime: 45,
      tasteProfiles: [],
    });
  });
});
