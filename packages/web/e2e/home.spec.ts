import { test, expect } from '@playwright/test';

test.describe('Home', () => {
  test('shows hero content and key CTAs', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('welcome-heading')).toBeVisible();
    await expect(page.getByTestId('browse-factions-button')).toBeVisible();
    await expect(page.getByTestId('roster-builder-button')).toBeVisible();
    await expect(page.getByTestId('collections-button')).toBeVisible();
    await expect(page.getByTestId('settings-button')).toBeVisible();
    await expect(page.getByText(/Data sourced from/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Wahapedia/i })).toBeVisible();
  });

  test('CTA navigation works', async ({ page }) => {
    await page.goto('/');

    const actions: Array<{ id: string; path: string }> = [
      { id: 'browse-factions-button', path: '/factions' },
      { id: 'roster-builder-button', path: '/rosters' },
      { id: 'collections-button', path: '/collections' },
      { id: 'settings-button', path: '/settings' }
    ];

    for (const action of actions) {
      await page.getByTestId(action.id).click();
      await expect(page).toHaveURL(new RegExp(`${action.path}$`));
      await page.goBack();
      await expect(page.getByTestId('welcome-heading')).toBeVisible();
    }
  });
});
