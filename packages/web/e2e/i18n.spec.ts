import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createRoster } from './utils';

test.use({ locale: 'en-GB', viewport: { width: 390, height: 844 } });

const cachedLanguages = (page: Page) =>
  page.evaluate(async () => {
    const cache = await caches.open('depot-translations');
    return Promise.all(
      (await cache.keys()).map(async (request) => {
        const data = await (await cache.match(request))!.json();
        return data.navigation?.home === 'Accueil' ||
          data.bookmarks === 'Favoris' ||
          data.automaticLanguage === 'Automatique' ||
          data.browseRules === 'Consulter les règles' ||
          data.copyName === '{{name}} (Copie)'
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
  await expect.poll(() => cachedLanguages(page)).toEqual(['en', 'en', 'en', 'en', 'en']);

  await page.getByLabel('Interface language').selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible();
  await expect(page.getByLabel('Langue de l’interface')).toHaveValue('fr');
  await expect
    .poll(async () => (await cachedLanguages(page)).sort())
    .toEqual(['en', 'en', 'en', 'en', 'en', 'fr', 'fr', 'fr', 'fr', 'fr']);
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
  await expect.poll(async () => (await cachedLanguages(page)).length).toBe(10);
  await page.reload();
  await expect(page.getByLabel('Langue de l’interface')).toHaveValue('fr');
  await expect(page.getByRole('link', { name: 'Accueil', exact: true })).toBeVisible();
});

test('refreshes an outdated cached hero translation without clearing browser storage', async ({
  page
}) => {
  await page.goto('/settings');
  await page.getByLabel('Interface language').selectOption('fr');
  await expect.poll(async () => (await cachedLanguages(page)).length).toBe(10);

  const seeded = await page.evaluate(async () => {
    const cache = await caches.open('depot-translations');
    for (const request of await cache.keys()) {
      const data = await (await cache.match(request))!.json();
      if (data.bookmarks === 'Favoris' && data.hero) {
        data.hero.title = 'Ancienne traduction du hero';
        await cache.put(request, Response.json(data));
        return true;
      }
    }
    return false;
  });
  expect(seeded).toBe(true);

  await page.goto('/');
  await expect(page.getByTestId('home-hero')).toContainText('depot fait peau neuve');
  expect(
    await page.evaluate(async () => {
      const cache = await caches.open('depot-translations');
      const resources = await Promise.all(
        (await cache.keys()).map(async (request) => (await cache.match(request))!.json())
      );
      return resources.find((data) => data.bookmarks === 'Favoris')?.hero.title;
    })
  ).toBe('depot fait peau neuve');
});

test('keeps French home and settings readable on narrow mobile screens', async ({
  page
}, testInfo) => {
  const { rosterName } = await createRoster(page);
  await page.goto('/settings');
  await page.getByLabel('Interface language').selectOption('fr');
  await expect(page).toHaveTitle('Paramètres et préférences | depot');
  await expect(page.getByRole('radio', { name: 'Système', exact: true })).toHaveAttribute(
    'aria-checked',
    'true'
  );
  await expect(
    page.getByRole('switch', { name: 'Afficher les textes d’ambiance' })
  ).toHaveAttribute('aria-checked', 'true');

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.getByRole('heading', { name: 'Paramètres', exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`settings-fr-${width}.png`) });
    await page
      .getByRole('switch', { name: 'Utiliser le partage du système' })
      .scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`settings-sharing-fr-${width}.png`) });
    expect(
      await page
        .locator('#app-content')
        .evaluate((element) => element.scrollWidth <= element.clientWidth)
    ).toBe(true);
  }

  await page.getByRole('link', { name: 'Accueil', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page).toHaveTitle('depot - Compagnon Warhammer 40,000 hors ligne');
  await expect(page.getByTestId('home-hero')).toContainText('depot fait peau neuve');
  await expect(page.getByTestId('roster-preview-card')).toContainText(rosterName);
  await expect(page.getByTestId('roster-preview-card')).toContainText('MODIFIÉE À L’INSTANT');
  await expect(page.getByTestId('rosters-section')).toContainText('Listes récentes');
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt');
    Object.assign(event, {
      prompt: async () => {},
      userChoice: Promise.resolve({ outcome: 'dismissed', platform: '' })
    });
    window.dispatchEvent(event);
  });
  await expect(page.getByRole('region', { name: 'Installer' })).toBeVisible();
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const copy = await page.getByTestId('install-banner').locator('p').last().boundingBox();
    expect(copy!.width).toBeGreaterThan(width - 80);
    await page.screenshot({ path: testInfo.outputPath(`home-fr-${width}.png`) });
    expect(
      await page
        .locator('#app-content')
        .evaluate((element) => element.scrollWidth <= element.clientWidth)
    ).toBe(true);
  }
  await page.getByRole('button', { name: 'Masquer', exact: true }).click();
  await expect(page.getByTestId('install-banner')).not.toBeVisible();
});

test('reloads in French offline with a production service worker', async ({ page, context }) => {
  test.skip(!process.env.WEB_BASE_URL, 'Requires a production preview with its service worker.');
  await page.goto('/settings');
  await page.getByLabel('Interface language').selectOption('fr');
  await expect.poll(async () => (await cachedLanguages(page)).length).toBe(8);
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
      .filter((request) => /\/(common|home|settings|catalog)-[^/]+\.json/.test(request.url))
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
