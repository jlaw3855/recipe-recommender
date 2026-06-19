import { expect, test } from '@playwright/test';

async function waitForBundledStatus(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForResponse(
    (response) => response.url().includes('/api/status') && response.status() === 200
  );
  await expect(page.getByTestId('mode-badge')).toContainText('Offline dataset', {
    timeout: 10000,
  });
}

test.describe('bundled mode', () => {
  test('loads with offline dataset badge', async ({ page }) => {
    await waitForBundledStatus(page);
    await expect(page.getByTestId('results-empty')).toBeVisible();
  });

  test('disables search until an ingredient is added', async ({ page }) => {
    await waitForBundledStatus(page);
    await expect(page.getByTestId('search-submit')).toBeDisabled();
  });

  test('searches for pasta and shows results', async ({ page }) => {
    await waitForBundledStatus(page);

    await page.getByTestId('ingredient-input').fill('pasta');
    await page.getByTestId('ingredient-input').press('Enter');

    const searchResponse = page.waitForResponse(
      (response) => response.url().includes('/api/recipes/search') && response.status() === 200
    );
    await page.getByTestId('search-submit').click();
    await searchResponse;

    await expect(page.getByTestId('results-list')).toBeVisible();
    await expect(page.getByText(/recipes found/i)).toBeVisible();
  });

  test('opens recipe detail from search results', async ({ page }) => {
    await waitForBundledStatus(page);

    await page.getByTestId('ingredient-input').fill('pasta');
    await page.getByTestId('ingredient-input').press('Enter');
    await page.getByTestId('search-submit').click();

    await expect(page.getByTestId('results-list')).toBeVisible();
    await page.locator('[data-testid^="recipe-card-"]').first().click();

    await expect(page.getByTestId('recipe-detail-title')).toBeVisible();
    await expect(page.getByTestId('recipe-detail-instructions')).toBeVisible();
  });

  test('shows autocomplete suggestions and adds ingredient', async ({ page }) => {
    await waitForBundledStatus(page);

    await page.getByTestId('ingredient-input').fill('gar');
    await page.waitForResponse(
      (response) => response.url().includes('/api/recipes/autocomplete') && response.status() === 200
    );
    await expect(page.getByTestId('ingredient-suggestions')).toBeVisible();
    await page.getByTestId('ingredient-suggestions').getByRole('button').first().click();

    await expect(page.locator('.flex.flex-wrap.gap-2').filter({ has: page.getByTestId('ingredient-input') })).toContainText('garlic');
  });

  test('shows empty state when no recipes match', async ({ page }) => {
    await waitForBundledStatus(page);

    await page.getByTestId('ingredient-input').fill('unicorn-meat');
    await page.getByTestId('ingredient-input').press('Enter');
    await page.getByTestId('search-submit').click();

    await expect(page.getByText(/no recipes found/i)).toBeVisible();
    await expect(page.getByTestId('results-list')).not.toBeVisible();
  });

  test('searches with vegetarian filter enabled', async ({ page }) => {
    await waitForBundledStatus(page);

    await page.getByRole('checkbox', { name: /vegetarian/i }).check();
    await page.getByTestId('ingredient-input').fill('pasta');
    await page.getByTestId('ingredient-input').press('Enter');
    await page.getByTestId('search-submit').click();

    await expect(page.getByTestId('results-list')).toBeVisible();
  });

  test('opens recipe 1001 when present in search results', async ({ page }) => {
    await waitForBundledStatus(page);

    await page.getByTestId('ingredient-input').fill('pasta');
    await page.getByTestId('ingredient-input').press('Enter');
    await page.getByTestId('search-submit').click();

    await expect(page.getByTestId('results-list')).toBeVisible();
    const card = page.getByTestId('recipe-card-1001');
    if (await card.count()) {
      await card.click();
      await expect(page.getByTestId('recipe-detail-title')).toBeVisible();
    }
  });
});
