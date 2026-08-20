import { test, expect } from '@playwright/test';

test.describe('Home', () => {
  test('shows dashboard content and sections', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('edition-notice')).toHaveCount(0);
    await expect(page.getByTestId('bookmarks-section')).toBeVisible();
    await expect(page.getByTestId('rosters-section')).toBeVisible();
    await expect(page.getByTestId('collections-section')).toBeVisible();
    await expect(page.getByText(/Data sourced from/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Wahapedia/i })).toBeVisible();
  });

  test('renders empty states when no local data', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('empty-bookmarks-home')).toBeVisible();
    await expect(page.getByText(/Your bookmarks will show up here/i)).toBeVisible();
    await expect(page.getByTestId('empty-rosters-home')).toBeVisible();
    await expect(page.getByTestId('empty-collections-home')).toBeVisible();
  });

  test('empty state create roster action navigates', async ({ page }) => {
    await page.goto('/');

    await page
      .getByTestId('empty-rosters-home')
      .getByRole('button', { name: 'Create roster' })
      .click();
    await expect(page).toHaveURL(/\/rosters\/create$/);
  });
});
