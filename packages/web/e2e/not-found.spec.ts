import { test, expect } from '@playwright/test';

test.describe('Not Found page', () => {
  test('shows 404 content and navigation actions', async ({ page }) => {
    await page.goto('/not-found');

    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByTestId('not-found-icon')).toBeVisible();
    await expect(page.getByTestId('page-heading')).toHaveText('Page Not Found');
    await expect(
      page.getByText(/The page you're looking for has been moved, deleted, or doesn't exist/i)
    ).toBeVisible();

    const homeButton = page.getByTestId('go-home-button');
    const backButton = page.getByTestId('go-back-button');

    await expect(homeButton).toBeVisible();
    await expect(backButton).toBeVisible();

    await homeButton.click();
    await expect(page).toHaveURL(/\/$/);
  });
});
