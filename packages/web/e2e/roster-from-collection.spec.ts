import { test, expect } from '@playwright/test';
import { resetClientState } from './utils';

test.describe('Roster from Collection', () => {
  test.beforeEach(async ({ page }) => {
    await resetClientState(page);
  });

  test('creates a roster prefilled from a collection', async ({ page }) => {
    await page.goto('/collections/create');

    const collectionName = `E2E Collection Roster ${Date.now()}`;
    await page.getByLabel('Name').fill(collectionName);
    await page.getByLabel('Faction').selectOption('astra-militarum');
    await page.getByTestId('create-collection-submit').click();
    await expect(page).toHaveURL(/\/collections\/[a-z0-9-]+$/i);

    const collectionUrl = page.url();

    await page.getByTestId('add-collection-units-button').click();
    await expect(page).toHaveURL(`${collectionUrl}/add-units`);

    const loadingLocator = page.locator('[data-testid="datasheet-loading"]');
    await loadingLocator.waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
    await loadingLocator.waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});

    const searchInput = page.getByTestId('datasheet-search');
    await expect(searchInput).toBeVisible({ timeout: 60000 });

    await searchInput.fill('Leman Russ Commander');
    const lemanAddButton = page.getByTestId('add-datasheet-leman-russ-commander');
    await expect(lemanAddButton).toBeVisible();
    await lemanAddButton.click();

    await searchInput.fill('Cadian Heavy Weapons Squad');
    const heavyAddButton = page.getByTestId('add-datasheet-cadian-heavy-weapons-squad');
    await expect(heavyAddButton).toBeVisible();
    await heavyAddButton.click();

    const reviewButton = page.getByRole('button', { name: /Review Selection/i });
    await expect(reviewButton).toBeVisible();
    await reviewButton.click();

    const summaryDrawer = page.getByTestId('unit-selection-summary');
    await expect(summaryDrawer).toBeVisible();
    await summaryDrawer.getByRole('button', { name: 'Confirm' }).click();

    await expect(page).toHaveURL(collectionUrl);
    const unitCards = page.getByTestId('collection-unit-card');
    await expect(unitCards).toHaveCount(2);

    await page.getByTestId('create-roster-from-collection-button').click();
    await expect(page).toHaveURL(`${collectionUrl}/new-roster`);

    await expect(page.getByTestId('datasheet-search')).toBeVisible({ timeout: 30000 });

    const collectionSelections = page.locator('[data-testid^="collection-selection-"]');
    await expect(collectionSelections).toHaveCount(2);
    await collectionSelections.nth(0).click();
    await collectionSelections.nth(1).click();

    const reviewSelectionButton = page.getByRole('button', { name: /Review Selection/i });
    await expect(reviewSelectionButton).toBeVisible();
    await reviewSelectionButton.click();

    const selectionSummary = page.getByTestId('unit-selection-summary');
    await expect(selectionSummary).toBeVisible();
    await selectionSummary.getByRole('button', { name: 'Confirm' }).click();

    await expect(page).toHaveURL(/\/rosters\/create\?fromCollection=/);

    await page.getByTestId('detachment-field-select').waitFor({ state: 'visible', timeout: 20000 });
    await page.getByTestId('detachment-field-select').selectOption({ index: 1 });

    await page.getByTestId('submit-button').click();
    await expect(page).toHaveURL(/\/rosters\/[a-z0-9-]+\/edit$/i);

    await expect(page.getByTestId('roster-unit-card-leman-russ-commander')).toBeVisible();
    await expect(page.getByTestId('roster-unit-card-cadian-heavy-weapons-squad')).toBeVisible();
  });
});
