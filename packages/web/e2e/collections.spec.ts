import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { depot } from '@depot/core';

test.use({ locale: 'en-GB' });

const readCollection = (page: Page, id: string) =>
  page.evaluate(
    (collectionId) =>
      new Promise<depot.StoredCollection>((resolve, reject) => {
        const open = indexedDB.open('depot-offline');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const get = db.transaction('collections').objectStore('collections').get(collectionId);
          get.onsuccess = () => {
            db.close();
            resolve(get.result);
          };
          get.onerror = () => {
            db.close();
            reject(get.error);
          };
        };
      }),
    id
  );

const createPopulatedCollection = async (page: Page, french = false) => {
  await page.goto('/collections');
  await page.getByTestId('create-collection-button').click();
  await page.getByTestId('collection-name-input').fill('Mes Tyranides');
  await page.getByTestId('collection-faction-field-select').selectOption('astra-militarum');
  await page.getByTestId('create-collection-submit').click();
  await expect(page).toHaveURL(/\/collections\/[0-9a-f-]{36}$/i);
  const url = page.url();
  await page.getByTestId('add-collection-units-button').click();
  await page.getByTestId('datasheet-search').fill('Leman Russ Commander');
  await page.getByTestId('add-datasheet-leman-russ-commander').click();
  await page
    .getByRole('button', { name: french ? /Vérifier la sélection/ : /Review Selection/ })
    .click();
  await page
    .getByTestId('unit-selection-summary')
    .getByRole('button', { name: french ? 'Confirmer' : 'Confirm' })
    .click();
  await expect(page).toHaveURL(url);
  await expect(page.getByTestId('collection-unit-card')).toHaveCount(1);
  return { url, id: url.split('/').pop()! };
};

test('French collection survives editing, filtering, reload and mobile layout', async ({
  page
}, testInfo) => {
  await page.goto('/settings');
  await page.getByLabel('Interface language').selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  const { url, id } = await createPopulatedCollection(page, true);
  await expect(page).toHaveTitle('Mes Tyranides - Suivi de collection | depot');
  const before = await readCollection(page, id);
  await page.getByTestId('collection-unit-card').click();
  await page.getByLabel('État de montage').selectOption('battle-ready');
  await page.getByTestId('save-button').click();
  await expect(page).toHaveURL(/#collection-unit-/);
  await page.getByTestId('collection-state-filter-battle-ready').click();
  await page.reload();
  await expect(page.getByTestId('collection-unit-card')).toHaveAttribute(
    'data-state',
    'battle-ready'
  );
  await expect(page.getByTestId('collection-unit-card')).toContainText('Prêt à jouer');
  expect(
    await page.evaluate(() => localStorage.getItem('depot:tag-selection:collection-state-filter'))
  ).toBe('battle-ready');
  expect((await readCollection(page, id)).points).toEqual(before.points);
  await page.getByTestId('collection-unit-card').click();
  await page.getByLabel('État de montage').selectOption('parade-ready');
  await page.getByTestId('save-button').click();
  await page.getByTestId('collection-state-filter-parade-ready').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId('collection-unit-card')).toContainText('Pour Exposition');
  expect(
    await page.locator('#app-content').evaluate((node) => node.scrollWidth <= node.clientWidth)
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('collections-fr-390.png') });
  await page.goto(url);
  await expect(page.getByTestId('collection-unit-card')).toContainText('Pour Exposition');
});

for (const form of ['unit', 'roster'] as const) {
  test(`keeps the ${form} form while the French collections domain loads and uses its offline cache`, async ({
    page
  }) => {
    const { url, id } = await createPopulatedCollection(page);
    const before = await readCollection(page, id);
    if (form === 'unit') {
      await page.getByTestId('collection-unit-card').click();
      await page.getByLabel('Build state').selectOption('parade-ready');
      await page.locator('[data-testid^="wargear-pill-"]').first().click();
    } else {
      await page.getByTestId('create-roster-from-collection-button').click();
      await page.locator('[data-testid^="collection-selection-"]').first().click();
      await page.getByRole('button', { name: /Review Selection/ }).click();
      await page
        .getByTestId('unit-selection-summary')
        .getByRole('button', { name: 'Confirm' })
        .click();
      await page.getByTestId('roster-name-input').fill('Liste tournoi');
    }
    const chosenWeapons = await page
      .locator('[data-testid^="wargear-pill-"][aria-pressed="true"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-testid')));
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let requested!: () => void;
    const request = new Promise<void>((resolve) => {
      requested = resolve;
    });
    const translationAsset = (url: URL) =>
      url.pathname.endsWith('/locales/fr/collections.json') && !url.searchParams.has('import');
    await page.route(translationAsset, async (route) => {
      requested();
      await gate;
      await route.continue();
    });
    // The Vite module is the product instance, so this switches a mounted form.
    await page.evaluate(() => {
      void import('/src/i18n.ts' /* @vite-ignore */).then(({ default: i18n }) =>
        i18n.changeLanguage('fr')
      );
    });
    await request;
    release();
    if (form === 'unit') {
      await expect(page.getByLabel('État de montage')).toHaveValue('parade-ready');
      await expect(page.getByTestId('collection-unit-state-tag')).toHaveText('Pour Exposition');
      expect(
        await page
          .locator('[data-testid^="wargear-pill-"][aria-pressed="true"]')
          .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-testid')))
      ).toEqual(chosenWeapons);
    } else {
      await expect(page.getByLabel('Nom de la liste')).toHaveValue('Liste tournoi');
      await expect(page.getByTestId('faction-field-select')).toHaveValue('astra-militarum');
      await expect(page.getByTestId('roster-form')).toContainText('1 unité');
    }
    expect(await readCollection(page, id)).toEqual(before);
    // Start a fresh i18n instance in the same browser to exercise Cache API fallback.
    await page.unroute(translationAsset);
    await page.route(translationAsset, (route) => route.abort());
    await page.goto('/settings');
    await page.getByLabel('Interface language').selectOption('fr');
    await page.goto(url);
    await expect(page.getByTestId('collection-state-filter-parade-ready')).toContainText(
      'Pour Exposition'
    );
    expect(await readCollection(page, id)).toEqual(before);
  });
}

test.describe('Collections', () => {
  test('collection form waits for factions and enables submit once filled', async ({ page }) => {
    await page.goto('/collections');
    await page.getByTestId('create-collection-button').click();

    const skeleton = page.getByTestId('field-skeleton');
    await skeleton
      .first()
      .waitFor({ state: 'attached', timeout: 5000 })
      .catch(() => {});
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
    await expect(page.getByTestId('create-collection-sheet')).toBeVisible();

    const uniqueName = `E2E Collection ${Date.now()}`;
    await page.getByLabel('Name').fill(uniqueName);

    const factionSelect = page.getByLabel('Faction');
    await factionSelect.selectOption({ index: 1 });

    await page.getByTestId('create-collection-submit').click();

    await expect(page).toHaveURL(/\/collections\/[0-9a-f-]{36}$/i);
    await expect(page.getByRole('heading', { name: uniqueName })).toBeVisible();
    await expect(page.getByTestId('add-collection-units-button')).toBeVisible();

    // State filters should be present
    const paradeFilter = page.getByTestId('collection-state-filter-parade-ready');
    await expect(paradeFilter).toBeVisible();

    await paradeFilter.click();
    const stored = await page.evaluate(() =>
      window.localStorage.getItem('depot:tag-selection:collection-state-filter')
    );
    expect(stored).toBe('parade-ready');

    // Reload and ensure filter selection persisted
    const currentUrl = page.url();
    await page.goto(currentUrl);
    const storedAfterReload = await page.evaluate(() =>
      window.localStorage.getItem('depot:tag-selection:collection-state-filter')
    );
    expect(storedAfterReload).toBe('parade-ready');
  });

  test('add Astra Militarum units to a collection', async ({ page }) => {
    await page.goto('/collections');

    await page.getByTestId('create-collection-button').click();
    await expect(page.getByTestId('create-collection-sheet')).toBeVisible();

    const uniqueName = `Astra Militarum E2E ${Date.now()}`;
    await page.getByLabel('Name').fill(uniqueName);

    const factionSelect = page.getByLabel('Faction');
    await factionSelect.selectOption('astra-militarum');

    await page.getByTestId('create-collection-submit').click();
    await expect(page).toHaveURL(/\/collections\/[0-9a-f-]{36}$/i);

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
