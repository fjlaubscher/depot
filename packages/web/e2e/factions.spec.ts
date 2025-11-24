import { test, expect } from '@playwright/test';

test.describe('Factions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/factions');
    await expect(page.getByRole('heading', { name: 'Factions' })).toBeVisible();
  });

  test('lists factions and allows navigation', async ({ page }) => {
    const factionLink = page.locator('a[href^="/faction/"]').first();

    await expect(factionLink).toBeVisible();

    const targetHref = await factionLink.getAttribute('href');
    await factionLink.click();

    if (targetHref) {
      await expect(page).toHaveURL(new RegExp(`${targetHref}$`));
    } else {
      await expect(page).toHaveURL(/\/faction\//);
    }
  });

  test('filters factions via search and clears filter', async ({ page }) => {
    const factionCards = page.locator('a[href^="/faction/"]');
    expect(await factionCards.count()).toBeGreaterThan(0);

    const search = page.getByTestId('faction-search');
    await search.fill('zzzzzz');
    await expect(page.getByText(/No factions found matching/i)).toBeVisible();

    await page.getByTestId('faction-search-clear').click();
    await expect(page.getByText(/No factions found matching/i)).toBeHidden();
    expect(await factionCards.count()).toBeGreaterThan(0);
  });
});
