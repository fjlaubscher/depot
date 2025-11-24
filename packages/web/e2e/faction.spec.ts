import { test, expect } from '@playwright/test';

test.describe('Faction detail', () => {
  test('renders datasheets, supports filtering, and shows detachments', async ({ page }) => {
    await page.goto('/factions');

    const firstFactionCard = page.locator('a[href^="/faction/"]').first();
    await expect(firstFactionCard).toBeVisible();

    const factionName =
      (await firstFactionCard.locator('h3, [role="heading"]').first().textContent())?.trim() ??
      'Faction';

    await firstFactionCard.click();

    await expect(page).toHaveURL(/\/faction\//);
    await expect(page.getByRole('heading', { name: new RegExp(factionName, 'i') })).toBeVisible();
    const datasheetsTab = page.getByTestId('faction-tab-datasheets');
    const detachmentsTab = page.getByTestId('faction-tab-detachments');

    await expect(datasheetsTab).toBeVisible();
    await expect(detachmentsTab).toBeVisible();

    const datasheetLinks = page.locator('a[href*="/datasheet/"]');
    expect(await datasheetLinks.count()).toBeGreaterThan(0);

    const searchInput = page.getByTestId('datasheet-search');
    await searchInput.fill('zzzzzz');
    await expect(page.getByText(/No datasheets found matching your filters/i)).toBeVisible();

    await page.getByTestId('datasheet-search-clear').click();
    await expect(page.getByText(/No datasheets found matching your filters/i)).toBeHidden();
    expect(await datasheetLinks.count()).toBeGreaterThan(0);

    await detachmentsTab.click();
    const detachments = page.getByTestId('faction-detachments');
    if ((await detachments.count()) > 0) {
      await expect(detachments.first()).toBeVisible();
    } else {
      await expect(page.getByText(/No detachments available/i)).toBeVisible();
    }
  });
});
