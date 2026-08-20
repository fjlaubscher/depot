import { test, expect } from '@playwright/test';

test.describe('Home', () => {
  test('shows hero and hero links when no local data', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('home-hero')).toContainText('11th edition is here');
    await expect(page.getByTestId('hero-links')).toBeVisible();
    await expect(page.getByTestId('bookmarks-section')).toHaveCount(0);
    await expect(page.getByTestId('rosters-section')).toHaveCount(0);
    await expect(page.getByTestId('collections-section')).toHaveCount(0);
    await expect(page.getByText(/Last updated/i)).toBeVisible();
  });

  test('hero rosters link navigates', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('hero-links').getByRole('link', { name: /Rosters/ }).click();
    await expect(page).toHaveURL(/\/rosters$/);
  });
});
