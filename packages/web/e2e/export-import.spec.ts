import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import type { ExportedCollection } from '../src/types/export';
import { createRoster, resetClientState } from './utils';

test.use({ locale: 'en-GB' });

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

  for (const language of ['en', 'fr']) {
    test(`exports and imports a collection in ${language} without translating its data`, async ({
      page
    }) => {
      if (language === 'fr') {
        await page.goto('/settings');
        await page.getByLabel('Interface language').selectOption('fr');
        await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
      }
      await page.goto('/collections');
      await page.getByTestId('create-collection-button').click();

      const collectionName = `E2E Collection ${Date.now()}`;
      await page.getByTestId('collection-name-input').fill(collectionName);
      await page.getByTestId('collection-faction-field-select').selectOption('astra-militarum');

      await page.getByTestId('create-collection-submit').click();
      await expect(page).toHaveURL(/\/collections\/[0-9a-f-]{36}$/i);
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

      const reviewButton = page.getByRole('button', {
        name: /Review Selection|Vérifier la sélection/i
      });
      await expect(reviewButton).toBeVisible();
      await reviewButton.click();

      const summaryDrawer = page.getByTestId('unit-selection-summary');
      await expect(summaryDrawer).toBeVisible();
      await summaryDrawer
        .getByRole('button', { name: language === 'fr' ? 'Confirmer' : 'Confirm' })
        .click();

      await expect(page).toHaveURL(collectionUrl);

      await page.getByTestId('collection-unit-card').click();
      await page
        .getByRole('combobox', { name: language === 'fr' ? 'État de montage' : 'Build state' })
        .selectOption('parade-ready');
      await page.getByTestId('save-button').click();
      await expect(page).toHaveURL(/#collection-unit-/);

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByTestId('export-collection-button').click()
      ]);

      await expect(download.suggestedFilename()).toMatch(/\.json$/i);
      const downloadPath = await download.path();
      expect(downloadPath).not.toBeNull();

      const payload: ExportedCollection = JSON.parse(await readFile(downloadPath!, 'utf8'));
      expect(payload).toMatchObject({
        kind: 'collection',
        version: 1,
        edition: 'wh40k11ed',
        collection: {
          name: collectionName,
          items: [expect.objectContaining({ state: 'parade-ready' })]
        }
      });
      expect(Object.keys(payload).sort()).toEqual([
        'collection',
        'dataVersion',
        'edition',
        'kind',
        'version'
      ]);

      await resetClientState(page);
      if (language === 'fr') {
        await page.goto('/settings');
        await page.getByLabel(/Interface language|Langue de l’interface/).selectOption('fr');
      }
      await page.goto('/collections');

      await page.setInputFiles('[data-testid="import-collection-input"]', downloadPath!);

      const collectionCards = page.locator('[data-testid^="collection-card-"]');
      await expect(collectionCards).toHaveCount(1, { timeout: 10000 });
      await expect(collectionCards.first()).toContainText(collectionName);
      await collectionCards.first().click();
      await expect(page.getByTestId('collection-unit-card')).toHaveAttribute(
        'data-state',
        'parade-ready'
      );
      const [importedDownload] = await Promise.all([
        page.waitForEvent('download'),
        page.getByTestId('export-collection-button').click()
      ]);
      const imported: ExportedCollection = JSON.parse(
        await readFile((await importedDownload.path())!, 'utf8')
      );
      expect(imported.collection.id).not.toBe(payload.collection.id);
      expect(imported.collection.items[0].id).not.toBe(payload.collection.items[0].id);
      expect(imported.collection.points).toEqual(payload.collection.points);
      expect(imported.collection.items[0].state).toBe(payload.collection.items[0].state);
      expect(imported.collection.name).toBe(payload.collection.name);
      expect(imported.collection.items[0].selectedWargear).toEqual(
        payload.collection.items[0].selectedWargear
      );
    });
  }
});
