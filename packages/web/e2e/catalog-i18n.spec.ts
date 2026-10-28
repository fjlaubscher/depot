import { expect, test } from '@playwright/test';

test.use({ locale: 'en-GB', viewport: { width: 390, height: 844 } });

test('browses French catalogue and profiles on mobile and desktop, preserving source data and bookmarks', async ({
  page
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/settings');
  await page.getByLabel('Interface language').selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

  await page.goto('/factions');
  await expect(page).toHaveTitle('Consulter les règles | depot');
  await expect(page.getByTestId('faction-search')).toHaveAccessibleName('Rechercher des factions');
  await page.getByTestId('faction-search').fill('absent-faction');
  await expect(page.getByText('Aucune faction ne correspond à « absent-faction »')).toBeVisible();
  await page.getByTestId('faction-search-clear').click();
  await page.locator('a[href="/faction/astra-militarum"]').click();
  await expect(page).toHaveURL(/\/faction\/astra-militarum$/);
  await expect(page).toHaveTitle('Astra Militarum - Présentation de la faction | depot');
  await expect(page.getByTestId('faction-tab-datasheets')).toContainText('Fiches techniques');
  await page.getByTestId('datasheet-search').fill('Cadian Heavy Weapons Squad');
  await page.locator('a[href$="/datasheet/cadian-heavy-weapons-squad"]').click();
  await expect(page).toHaveURL(/\/datasheet\/cadian-heavy-weapons-squad$/);
  await expect(page.getByTestId('page-header')).toContainText('Cadian Heavy Weapons Squad');
  await expect(page.getByTestId('page-header')).toContainText('Fiche technique');
  await expect(page.locator('.stat-cell .type-label')).toHaveText([
    'M',
    'E',
    'Sv',
    'PV',
    'Cd',
    'OC'
  ]);

  const bookmark = page.getByTestId('bookmark-datasheet-button');
  await bookmark.click();
  await expect(bookmark).toHaveAccessibleName('Retirer des favoris');

  const wargear = page
    .locator('details')
    .filter({ has: page.locator('summary', { hasText: 'Équipement et options' }) });
  if (!(await wargear.evaluate((node) => (node as HTMLDetailsElement).open))) {
    await wargear.locator('summary').click();
  }
  const table = wargear.locator('table').first();
  await expect(table.getByRole('columnheader')).toHaveText([
    'Armes de tir',
    'Portée',
    'A',
    'CT',
    'F',
    'PA',
    'D'
  ]);
  await expect(table).toContainText('D6+1');
  await expect(table).toContainText(/SUSTAINED HITS 1/i);

  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 1000 });
    await table.scrollIntoViewIfNeeded();
    expect(
      await page.locator('#app-content').evaluate((node) => node.scrollWidth <= node.clientWidth)
    ).toBe(true);
    const overflowing = await table.evaluate((node) =>
      [...node.querySelectorAll('th, td')]
        .filter((cell) => cell.scrollWidth > cell.clientWidth + 1)
        .map((cell) => cell.textContent?.trim())
    );
    expect(overflowing).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`catalog-fr-${width}.png`) });
  }

  await page.goto('/faction/space-marines/detachments');
  await expect(page.getByTestId('faction-tab-detachments')).toContainText('Détachements');
  const filter = page.getByLabel('Filtrer par disposition de force');
  await expect(filter).toBeVisible();
  await page.getByTestId('detachment-search').fill('Gladius');
  await page.getByTestId('detachment-card').filter({ hasText: 'Gladius Task Force' }).click();
  await expect(page).toHaveURL(/\/detachment\/gladius-task-force$/);
  await expect(page.getByTestId('detachment-abilities')).toContainText('Aptitudes de détachement');
  await expect(page.getByTestId('detachment-enhancements')).toContainText('Optimisations');
  await expect(page.getByTestId('detachment-stratagems')).toContainText('Stratagèmes');

  await page.goto('/settings');
  await page.getByLabel('Langue de l’interface').selectOption('en');
  await page.goto('/faction/astra-militarum/datasheet/cadian-heavy-weapons-squad');
  await expect(page.getByTestId('bookmark-datasheet-button')).toHaveAccessibleName(
    'Remove bookmark'
  );
  await expect(page.locator('.stat-cell .type-label')).toHaveText([
    'M',
    'T',
    'Sv',
    'W',
    'Ld',
    'OC'
  ]);
  expect(errors).toEqual([]);
});
