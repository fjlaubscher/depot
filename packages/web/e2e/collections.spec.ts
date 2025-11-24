import { test, expect } from '@playwright/test';

test.describe('Collections', () => {
  test('create collection and persist state filter selection', async ({ page }) => {
    await page.goto('/collections');

    // Start create flow
    await page.getByTestId('create-collection-button').click();
    await expect(page).toHaveURL(/\/collections\/create/);

    const uniqueName = `E2E Collection ${Date.now()}`;
    await page.getByLabel('Name').fill(uniqueName);

    const factionSelect = page.getByLabel('Faction');
    await factionSelect.selectOption({ index: 1 });

    await page.getByTestId('create-collection-submit').click();

    await expect(page).toHaveURL(/\/collections\/[a-z0-9-]+$/i);
    await expect(page.getByRole('heading', { name: uniqueName })).toBeVisible();
    await expect(page.getByTestId('add-collection-units-button')).toBeVisible();

    // State filters should be present
    const paradeFilter = page.getByTestId('collection-state-filter-parade-ready');
    await expect(paradeFilter).toBeVisible();

    await paradeFilter.click();
    const stored = await page.evaluate(
      () => window.localStorage.getItem('depot:tag-selection:collection-state-filter')
    );
    expect(stored).toBe('parade-ready');

    // Reload and ensure filter selection persisted
    const currentUrl = page.url();
    await page.goto(currentUrl);
    const storedAfterReload = await page.evaluate(
      () => window.localStorage.getItem('depot:tag-selection:collection-state-filter')
    );
    expect(storedAfterReload).toBe('parade-ready');
  });
});
