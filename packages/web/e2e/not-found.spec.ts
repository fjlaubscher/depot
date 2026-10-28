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

test('translates secondary pages and recovery actions in French at mobile widths', async ({
  page
}) => {
  await page.goto('/settings');
  await page.setViewportSize({ width: 320, height: 844 });
  for (const [path, title] of [
    ['/about', 'About depot'],
    ['/privacy', 'Privacy Policy'],
    ['/unknown-route', 'Page Not Found']
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    expect(
      await page.locator('#app-content').evaluate((node) => node.scrollWidth <= node.clientWidth)
    ).toBe(true);
  }
  await page.goto('/settings');
  await page.getByLabel('Interface language').selectOption('fr');
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const [path, title] of [
      ['/about', 'À propos de depot'],
      ['/privacy', 'Politique de confidentialité'],
      ['/unknown-route', 'Page introuvable']
    ]) {
      await page.goto(path);
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
      await expect(page).toHaveTitle(new RegExp(title));
      expect(
        await page.locator('#app-content').evaluate((node) => node.scrollWidth <= node.clientWidth)
      ).toBe(true);
    }
  }
  await expect(page.getByTestId('go-home-button')).toHaveText('Retour à l’accueil');
  await page.getByTestId('go-back-button').click();
  await expect(page).toHaveURL(/\/privacy$/);
  await page.goto('/unknown-route');
  await page.getByTestId('go-home-button').click();
  await expect(page).toHaveURL(/\/$/);
});
