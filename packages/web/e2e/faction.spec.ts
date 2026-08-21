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
    await expect(page).toHaveURL(/\/faction\/[^/]+\/detachments$/);
    await expect(page.getByTestId('faction-detachments')).toBeVisible();

    // The tab is a real URL, so a cold load lands on it.
    await page.reload();
    await expect(page.getByTestId('faction-detachments')).toBeVisible();
  });

  test('Space Marines Gladius shows DP and Force Disposition', async ({ page }) => {
    await page.goto('/faction/space-marines/detachments');

    const detachments = page.getByTestId('faction-detachments');
    await expect(detachments).toBeVisible();
    await expect(detachments).toContainText(/Gladius Task Force/i);

    await detachments.getByRole('link', { name: /Gladius Task Force/i }).click();
    await expect(page).toHaveURL(/\/detachment\/gladius-task-force$/);
    await expect(
      page.getByRole('heading', { level: 1, name: /Gladius Task Force/i })
    ).toBeVisible();
    const meta = page.getByTestId('detachment-meta');
    await expect(meta).toContainText(/\d+\s*DP/);
    await expect(meta).toContainText(
      /Take and Hold|Disruption|Purge the Foe|Priority Assets|Reconnaissance/
    );
    await expect(page.getByTestId('detachment-stratagems')).toBeVisible();

    await page.goto('/faction/space-marines/detachment/shield-of-the-void');
    await expect(
      page.getByRole('heading', { level: 1, name: /Shield of the Void/i })
    ).toBeVisible();
    await expect(page.getByTestId('detachment-meta')).toContainText(/Boarding Actions/);
  });
});
