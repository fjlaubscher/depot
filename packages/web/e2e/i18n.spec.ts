import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

test.use({ locale: 'en-GB', viewport: { width: 390, height: 844 } });

const cachedLanguages = (page: Page) =>
  page.evaluate(async () => {
    const cache = await caches.open('depot-translations');
    return Promise.all(
      (await cache.keys()).map(async (request) => {
        const data = await (await cache.match(request))!.json();
        return data.navigation?.home === 'Accueil' ||
          data.bookmarks === 'Favoris' ||
          data.automaticLanguage === 'Automatique'
          ? 'fr'
          : 'en';
      })
    );
  });

test('prepares English only until French is selected, then updates mounted mobile controls', async ({
  page
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/settings');
  await expect(page.getByLabel('Interface language')).toBeVisible();
  await expect.poll(() => cachedLanguages(page)).toEqual(['en', 'en', 'en']);

  await page.getByLabel('Interface language').selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible();
  await expect(page.getByLabel('Langue de l’interface')).toHaveValue('fr');
  await expect
    .poll(async () => (await cachedLanguages(page)).sort())
    .toEqual(['en', 'en', 'en', 'fr', 'fr', 'fr']);
  await page.getByRole('link', { name: 'Armées', exact: true }).click();
  await expect(page).toHaveURL(/\/armies$/);
  await page.getByTestId('armies-tile-collections').click();
  await expect(page).toHaveURL(/\/collections$/);
  await expect(page.getByTestId('import-collection-button')).toHaveText('Importer');
  await page.evaluate(async () => {
    await Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
        .map((animation) => animation.finished.catch(() => {}))
    );
  });
  await page.screenshot({ path: testInfo.outputPath('french-mobile.png'), fullPage: true });
  await page.getByTestId('create-collection-button').click();
  const close = page.getByRole('button', { name: 'Fermer', exact: true });
  await expect(close).toHaveAttribute('title', 'Fermer');
  await close.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('create-collection-sheet')).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('preserves French and cached translations across reloads', async ({ page }) => {
  await page.goto('/settings');
  await page.getByLabel('Interface language').selectOption('fr');
  await expect.poll(async () => (await cachedLanguages(page)).length).toBe(6);
  await page.reload();
  await expect(page.getByLabel('Langue de l’interface')).toHaveValue('fr');
  await expect(page.getByRole('link', { name: 'Accueil', exact: true })).toBeVisible();
});

test('reloads in French offline with a production service worker', async ({ page, context }) => {
  test.skip(!process.env.WEB_BASE_URL, 'Requires a production preview with its service worker.');
  await page.goto('/settings');
  await page.getByLabel('Interface language').selectOption('fr');
  await expect.poll(async () => (await cachedLanguages(page)).length).toBe(6);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);

  const precachedTranslations = await page.evaluate(async () => {
    const names = (await caches.keys()).filter((name) => name.startsWith('workbox-precache'));
    const requests = (
      await Promise.all(names.map(async (name) => (await caches.open(name)).keys()))
    ).flat();
    return requests
      .filter((request) => /\/(common|home|settings)-[^/]+\.json/.test(request.url))
      .map((request) => request.url);
  });
  expect(precachedTranslations).toEqual([]);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByLabel('Langue de l’interface')).toHaveValue('fr');
  await expect(page.getByTestId('offline-banner')).toContainText('Hors ligne');
  await expect(page.getByRole('link', { name: 'Règles', exact: true })).toBeVisible();
  await page.getByLabel('Langue de l’interface').selectOption('en');
  await expect(page.getByLabel('Interface language')).toHaveValue('en');
  await expect(page.getByRole('link', { name: 'Rules', exact: true })).toBeVisible();
});
