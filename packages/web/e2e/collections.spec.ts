import { test, expect } from '@playwright/test';

test.describe('Collections', () => {
  test('collection form waits for factions and enables submit once filled', async ({ page }) => {
    await page.goto('/collections/create');

    const skeleton = page.getByTestId('field-skeleton');
    await skeleton.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    await page.getByTestId('collection-faction-field-select').waitFor({ state: 'visible' });

    const submitButton = page.getByTestId('create-collection-submit');
    await expect(submitButton).toBeDisabled();

    await page.getByTestId('collection-name-input').fill(`E2E Collection ${Date.now()}`);
    await page.getByTestId('collection-faction-field-select').selectOption({ index: 1 });

    await expect(submitButton).not.toBeDisabled();
  });

  test('create collection and persist state filter selection', async ({ page }) => {
    await page.goto('/collections');

    // Start create flow
    await page.getByTestId('create-collection-button').click();
    await expect(page).toHaveURL(/\/collections\/create/);

    const uniqueName = `E2E Collection ${Date.now()}`;
    await page.getByLabel('Name').fill(uniqueName);

    const factionSelect = page.getByLabel('Faction');
    await factionSelect.selectOption({ index: 1 });

    await page.getByTestId('create-collection-submit').click();

    await expect(page).toHaveURL(/\/collections\/[a-z0-9-]+$/i);
    await expect(page.getByRole('heading', { name: uniqueName })).toBeVisible();
    await expect(page.getByTestId('add-collection-units-button')).toBeVisible();

    // State filters should be present
    const paradeFilter = page.getByTestId('collection-state-filter-parade-ready');
    await expect(paradeFilter).toBeVisible();

    await paradeFilter.click();
    const stored = await page.evaluate(
      () => window.localStorage.getItem('depot:tag-selection:collection-state-filter')
    );
    expect(stored).toBe('parade-ready');

    // Reload and ensure filter selection persisted
    const currentUrl = page.url();
    await page.goto(currentUrl);
    const storedAfterReload = await page.evaluate(
      () => window.localStorage.getItem('depot:tag-selection:collection-state-filter')
    );
    expect(storedAfterReload).toBe('parade-ready');
  });

  test('add Astra Militarum units to a collection', async ({ page }) => {
    await page.goto('/collections');

    await page.getByTestId('create-collection-button').click();
    await expect(page).toHaveURL(/\/collections\/create/);

    const uniqueName = `Astra Militarum E2E ${Date.now()}`;
    await page.getByLabel('Name').fill(uniqueName);

    const factionSelect = page.getByLabel('Faction');
    await factionSelect.selectOption('astra-militarum');

    await page.getByTestId('create-collection-submit').click();
    await expect(page).toHaveURL(/\/collections\/[a-z0-9-]+$/i);

    const collectionUrl = page.url();
    await expect(page.getByRole('heading', { name: uniqueName })).toBeVisible();

    await page.getByTestId('add-collection-units-button').click();
    await expect(page).toHaveURL(`${collectionUrl}/add-units`);

    const loadingLocator = page.locator('[data-testid="datasheet-loading"]');
    await loadingLocator.waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
    await loadingLocator.waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});

    const searchInput = page.getByTestId('datasheet-search');
    await expect(searchInput).toBeVisible({ timeout: 60000 });

    // Add a Leman Russ Commander
    await searchInput.fill('Leman Russ Commander');
    const lemanAddButton = page.getByTestId('add-datasheet-leman-russ-commander');
    await expect(lemanAddButton).toBeVisible();
    await lemanAddButton.click();

    // Queue two Heavy Weapons Squads
    await searchInput.fill('Cadian Heavy Weapons Squad');
    const cadianAddButton = page.getByTestId('add-datasheet-cadian-heavy-weapons-squad');
    await expect(cadianAddButton).toBeVisible();
    await cadianAddButton.click();
    await cadianAddButton.click();

    const reviewButton = page.getByRole('button', { name: /Review Selection/i });
    await expect(reviewButton).toBeVisible();
    await reviewButton.click();

    const summaryDrawer = page.getByTestId('unit-selection-summary');
    await expect(summaryDrawer).toBeVisible();
    await expect(summaryDrawer.getByText('Leman Russ Commander')).toBeVisible();
    await expect(summaryDrawer.getByText('Cadian Heavy Weapons Squad')).toBeVisible();
    await expect(summaryDrawer.getByText(/3 units/i)).toBeVisible();

    await summaryDrawer.getByRole('button', { name: 'Confirm' }).click();
    await expect(page).toHaveURL(collectionUrl);

    const unitCards = page.getByTestId('collection-unit-card');
    await expect(unitCards).toHaveCount(3);
    await expect(page.getByText('Leman Russ Commander')).toBeVisible();
    const cadianCards = unitCards.filter({ hasText: 'Cadian Heavy Weapons Squad' });
    await expect(cadianCards).toHaveCount(2);
  });
});
