import { test, expect } from '@playwright/test';
import { createRoster, resetClientState } from './utils';

test.describe('Export/Import JSON', () => {
  test.beforeEach(async ({ page }) => {
    await resetClientState(page);
  });

  test('exports a roster to JSON and imports it on the rosters list', async ({ page }) => {
    const { rosterBaseUrl, rosterName } = await createRoster(page);

    await page.goto(rosterBaseUrl);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-button').click()
    ]);

    await expect(download.suggestedFilename()).toMatch(/\.json$/i);
    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();

    await resetClientState(page);
    await page.goto('/rosters');

    await page.setInputFiles('[data-testid="import-roster-input"]', downloadPath!);

    const rosterCards = page.getByTestId('roster-card');
    await expect(rosterCards).toHaveCount(1, { timeout: 10000 });
    await expect(rosterCards.first()).toContainText(rosterName);
  });

  test('exports a collection to JSON and imports it on the collections list', async ({ page }) => {
    await page.goto('/collections/create');

    const collectionName = `E2E Collection ${Date.now()}`;
    await page.getByLabel('Name').fill(collectionName);
    await page.getByLabel('Faction').selectOption('astra-militarum');

    await page.getByTestId('create-collection-submit').click();
    await expect(page).toHaveURL(/\/collections\/[a-z0-9-]+$/i);
    const collectionUrl = page.url();

    // Add at least one unit so export is available
    await page.getByTestId('add-collection-units-button').click();
    await expect(page).toHaveURL(`${collectionUrl}/add-units`);

    const loadingLocator = page.locator('[data-testid="datasheet-loading"]');
    await loadingLocator.waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
    await loadingLocator.waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});

    const searchInput = page.getByTestId('datasheet-search');
    await expect(searchInput).toBeVisible({ timeout: 60000 });

    await searchInput.fill('Leman Russ Commander');
    const addButton = page.getByTestId('add-datasheet-leman-russ-commander');
    await expect(addButton).toBeVisible();
    await addButton.click();

    const reviewButton = page.getByRole('button', { name: /Review Selection/i });
    await expect(reviewButton).toBeVisible();
    await reviewButton.click();

    const summaryDrawer = page.getByTestId('unit-selection-summary');
    await expect(summaryDrawer).toBeVisible();
    await summaryDrawer.getByRole('button', { name: 'Confirm' }).click();

    await expect(page).toHaveURL(collectionUrl);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-collection-button').click()
    ]);

    await expect(download.suggestedFilename()).toMatch(/\.json$/i);
    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();

    await resetClientState(page);
    await page.goto('/collections');

    await page.setInputFiles('[data-testid="import-collection-input"]', downloadPath!);

    const collectionCards = page.locator('[data-testid^="collection-card-"]');
    await expect(collectionCards).toHaveCount(1, { timeout: 10000 });
    await expect(collectionCards.first()).toContainText(collectionName);
  });
});
