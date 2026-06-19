import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import IngredientInput from './IngredientInput';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('IngredientInput', () => {
  it('adds an ingredient when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<IngredientInput ingredients={[]} onChange={onChange} />);

    const input = screen.getByTestId('ingredient-input');
    await user.type(input, 'pasta{Enter}');

    expect(onChange).toHaveBeenCalledWith(['pasta']);
  });

  it('shows autocomplete suggestions from the API', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ results: [{ name: 'garlic' }] }), { status: 200 })
        )
      )
    );

    render(<IngredientInput ingredients={[]} onChange={onChange} />);

    const input = screen.getByTestId('ingredient-input');
    await user.type(input, 'gar');

    await vi.advanceTimersByTimeAsync(500);

    await waitFor(() => {
      expect(screen.getByTestId('ingredient-suggestions')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'garlic' }));
    expect(onChange).toHaveBeenCalledWith(['garlic']);
  });
});
