import { test, expect } from '@playwright/test';

test.describe('Home', () => {
  test('shows the hero when no local data', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('home-hero')).toContainText('depot has a new look');
    await expect(page.getByTestId('bookmarks-section')).toHaveCount(0);
    await expect(page.getByTestId('rosters-section')).toHaveCount(0);
    await expect(page.getByTestId('collections-section')).toHaveCount(0);
    // Shown once per breakpoint: the rail carries it on desktop, the home
    // footer on mobile — never both.
    await expect(
      page.locator('p', { hasText: /Wahapedia data/ }).filter({ visible: true })
    ).toHaveCount(1);
  });

  test('the bottom bar navigates to rosters', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Rosters' }).click();
    await expect(page).toHaveURL(/\/rosters$/);
  });
});
