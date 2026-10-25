import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { depot } from '@depot/core';
import type { ExportedRoster } from '../src/types/export';
import { resetClientState, stubClipboardOnly } from './utils';

test.use({ locale: 'en-GB' });

const storedRoster = (page: Page, id: string) =>
  page.evaluate(
    (rosterId) =>
      new Promise<depot.StoredRoster | undefined>((resolve, reject) => {
        const open = indexedDB.open('depot-offline');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const get = db.transaction('rosters').objectStore('rosters').get(rosterId);
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

const exportRoster = async (page: Page) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('export-button').click()
  ]);
  const path = await download.path();
  expect(path).not.toBeNull();
  const payload: ExportedRoster = JSON.parse(await readFile(path!, 'utf8'));
  return { path: path!, payload, filename: download.suggestedFilename() };
};

test('creates and edits a French roster, shares it, and preserves the JSON contract across languages and import', async ({
  page
}, testInfo) => {
  await resetClientState(page);
  await page.goto('/settings');
  await page.getByLabel('Interface language').selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await page.goto('/rosters');
  await page.getByRole('button', { name: 'Créer une nouvelle liste' }).click();
  await page.getByLabel('Nom de la liste').fill('Liste française — essai');
  await page.getByTestId('faction-field-select').selectOption({ label: 'Drukhari' });
  await page.getByTestId('detachment-field-select').selectOption({ index: 1 });
  const detachmentName = await page
    .getByTestId('detachment-field-select')
    .locator('option:checked')
    .textContent();
  await page.getByTestId('submit-button').click();
  await expect(page).toHaveURL(/\/rosters\/[a-z0-9-]+\/edit$/i);
  const editUrl = page.url();
  const baseUrl = editUrl.replace(/\/edit$/, '');
  const id = baseUrl.split('/').pop()!;
  await expect
    .poll(async () => (await storedRoster(page, id))?.name)
    .toBe('Liste française — essai');

  await page.getByTestId('add-units-button').click();
  await page.getByTestId('datasheet-search').fill('Archon');
  await page.getByTestId('add-datasheet-archon').click();
  await page.getByRole('button', { name: /Vérifier la sélection/ }).click();
  await page
    .getByTestId('unit-selection-summary')
    .getByRole('button', { name: 'Confirmer' })
    .click();
  await expect(page).toHaveURL(editUrl);
  await page.getByTestId('roster-unit-card-archon').click();
  const weapon = page.locator('[data-testid^="wargear-pill-"]').first();
  await expect(weapon).toBeVisible();
  if ((await weapon.getAttribute('aria-pressed')) !== 'true') await weapon.click();
  const weaponName = (await weapon.textContent())!.trim();
  await page
    .locator('[data-testid^="enhancement-option-"]:not([data-testid="enhancement-option-none"])')
    .first()
    .click();
  await page.getByRole('switch', { name: 'Désigner comme seigneur de guerre' }).click();
  await page.getByTestId('save-button').click();
  await expect(page).toHaveURL(/\/edit#unit-/);
  await expect
    .poll(async () => {
      const roster = await storedRoster(page, id);
      return Boolean(
        roster?.warlordUnitId &&
        roster.units[0]?.selectedWargear.some((entry) => entry.name === weaponName)
      );
    })
    .toBe(true);
  await page.reload();
  await page.getByTestId('roster-unit-card-archon').click();
  await expect(page.getByRole('button', { name: weaponName, exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(
    page.getByRole('switch', { name: 'Désigner comme seigneur de guerre' })
  ).toHaveAttribute('aria-checked', 'true');
  await page.goto(baseUrl);
  const { getWrites } = await stubClipboardOnly(page);
  await page.getByTestId('share-roster-button').click();
  await expect.poll(getWrites).toHaveLength(1);
  const [shared] = await getWrites();
  expect(shared).toContain('[Seigneur de guerre] Archon');
  expect(shared).toContain(`*Détachement:* ${detachmentName}`);
  expect(shared).toContain(weaponName);
  const french = await exportRoster(page);
  expect(Object.keys(french.payload).sort()).toEqual([
    'dataVersion',
    'edition',
    'kind',
    'roster',
    'version'
  ]);
  expect(french.payload).toMatchObject({
    kind: 'roster',
    version: 1,
    edition: 'wh40k11ed',
    roster: { id, name: 'Liste française — essai', factionSlug: 'drukhari' }
  });
  expect(
    french.payload.roster.units[0].selectedWargear.some((entry) => entry.name === weaponName)
  ).toBe(true);
  expect(french.payload.roster.warlordUnitId).toBe(french.payload.roster.units[0].id);
  expect(french.payload.roster.enhancements).toHaveLength(1);
  expect(french.payload.roster.enhancements[0].unitId).toBe(french.payload.roster.units[0].id);
  expect(french.payload.roster).not.toHaveProperty('language');

  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.locator('#app-content').evaluate((node) => node.scrollWidth <= node.clientWidth)
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`roster-fr-${width}.png`) });
  }
  await page.goto('/settings');
  await page.getByLabel('Langue de l’interface').selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.goto(baseUrl);
  const english = await exportRoster(page);
  expect(english.filename).toBe(french.filename);
  // Loading a roster stamps updatedAt through the existing autosave.
  const { updatedAt: _frenchUpdated, ...frenchRoster } = french.payload.roster;
  const { updatedAt: _englishUpdated, ...englishRoster } = english.payload.roster;
  expect(englishRoster).toEqual(frenchRoster);
  expect({ ...english.payload, roster: undefined }).toEqual({
    ...french.payload,
    roster: undefined
  });

  await page.goto('/rosters');
  await page.getByTestId('import-roster-input').setInputFiles(french.path);
  await expect(page.getByTestId('roster-card')).toHaveCount(2);
  const copies = await page.evaluate(
    () =>
      new Promise<depot.StoredRoster[]>((resolve, reject) => {
        const open = indexedDB.open('depot-offline');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const get = db.transaction('rosters').objectStore('rosters').getAll();
          get.onsuccess = () => {
            db.close();
            resolve(get.result);
          };
          get.onerror = () => {
            db.close();
            reject(get.error);
          };
        };
      })
  );
  const imported = copies.find((roster) => roster.id !== id)!;
  expect(imported.name).toBe(french.payload.roster.name);
  expect(imported.units[0].id).not.toBe(french.payload.roster.units[0].id);
  expect(imported.warlordUnitId).toBe(imported.units[0].id);
  expect(imported.enhancements[0].unitId).toBe(imported.units[0].id);
  expect(imported.enhancements[0].enhancement.id).toBe(
    french.payload.roster.enhancements[0].enhancement.id
  );
  expect(imported.points).toEqual(french.payload.roster.points);
  expect(imported.factionId).toBe(french.payload.roster.factionId);
  expect(imported.units[0].selectedWargear.map((entry) => entry.id)).toEqual(
    french.payload.roster.units[0].selectedWargear.map((entry) => entry.id)
  );
});
