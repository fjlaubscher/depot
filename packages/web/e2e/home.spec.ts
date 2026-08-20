import { test, expect } from '@playwright/test';

test.describe('Home', () => {
  test('shows hero and get-started when no local data', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('home-hero')).toContainText('11th edition is here');
    await expect(page.getByTestId('get-started')).toBeVisible();
    await expect(page.getByTestId('bookmarks-section')).toHaveCount(0);
    await expect(page.getByTestId('rosters-section')).toHaveCount(0);
    await expect(page.getByTestId('collections-section')).toHaveCount(0);
    await expect(page.getByText(/Last updated/i)).toBeVisible();
  });

  test('empty state create roster action navigates', async ({ page }) => {
    await page.goto('/');

    await page
      .getByTestId('get-started')
      .getByRole('link', { name: /Create roster/ })
      .click();
    await expect(page).toHaveURL(/\/rosters\/create$/);
  });
});
