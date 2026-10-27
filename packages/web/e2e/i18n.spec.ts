import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createRoster } from './utils';
import { readdirSync, readFileSync } from 'node:fs';

const namespaces = readdirSync(new URL('../src/locales/en/', import.meta.url)).filter((file) =>
  file.endsWith('.json')
);
const dictionaries = ['en', 'fr'].flatMap((language) =>
  namespaces.map((file) => ({
    language,
    content: JSON.stringify(
      JSON.parse(
        readFileSync(new URL(`../src/locales/${language}/${file}`, import.meta.url), 'utf8')
      )
    )
  }))
);
const expectedLanguages = (languages: string[]) =>
  languages.flatMap((language) => namespaces.map(() => language)).sort();

test.use({ locale: 'en-GB', viewport: { width: 390, height: 844 } });

const cachedLanguages = (page: Page) =>
  page.evaluate(async (dictionaries) => {
    const cache = await caches.open('depot-translations');
    return Promise.all(
      (await cache.keys()).map(async (request) => {
        const data = await (await cache.match(request))!.json();
        return (
          dictionaries.find((entry) => entry.content === JSON.stringify(data))?.language ??
          'unknown'
        );
      })
    );
  }, dictionaries);

test('prepares English only until French is selected, then updates mounted mobile controls', async ({
  page
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/settings');
  await expect(page.getByLabel('Interface language')).toBeVisible();
  await expect.poll(() => cachedLanguages(page)).toEqual(expectedLanguages(['en']));

  await page.getByLabel('Interface language').selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible();
  await expect(page.getByLabel('Langue de l’interface')).toHaveValue('fr');
  await expect
    .poll(async () => (await cachedLanguages(page)).sort())
    .toEqual(expectedLanguages(['en', 'fr']));
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
  await expect.poll(async () => (await cachedLanguages(page)).length).toBe(namespaces.length * 2);
  await page.reload();
  await expect(page.getByLabel('Langue de l’interface')).toHaveValue('fr');
  await expect(page.getByRole('link', { name: 'Accueil', exact: true })).toBeVisible();
});

test('keeps legacy preferences when adding and persisting a language choice', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByLabel('Interface language')).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('depot-offline');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('settings', 'readwrite');
          tx.objectStore('settings').put(
            { theme: 'dark', showFluff: false, showLegends: true },
            'settings'
          );
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        };
      })
  );
  await page.reload();
  await expect(page.getByRole('switch', { name: 'Show Fluff Text' })).toHaveAttribute(
    'aria-checked',
    'false'
  );
  await page.getByLabel('Interface language').selectOption('fr');
  await page.reload();
  await expect(page.getByLabel('Langue de l’interface')).toHaveValue('fr');
  await expect(
    page.getByRole('switch', { name: 'Afficher les textes d’ambiance' })
  ).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByRole('switch', { name: 'Unités Legends' })).toHaveAttribute(
    'aria-checked',
    'true'
  );
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test.describe('unsupported browser language', () => {
  test.use({ locale: 'de-DE' });
  test('falls back to English on a first visit', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByLabel('Interface language')).toHaveValue('auto');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect.poll(() => cachedLanguages(page)).toEqual(expectedLanguages(['en']));
  });
});

test('refreshes an outdated cached hero translation without clearing browser storage', async ({
  page
}) => {
  await page.goto('/settings');
  await page.getByLabel('Interface language').selectOption('fr');
  await expect.poll(async () => (await cachedLanguages(page)).length).toBe(namespaces.length * 2);

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
  await expect.poll(() => cachedLanguages(page)).toEqual(expectedLanguages(['en']));
  await page.getByLabel('Interface language').selectOption('fr');
  await expect
    .poll(async () => (await cachedLanguages(page)).sort())
    .toEqual(expectedLanguages(['en', 'fr']));
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);

  const precachedTranslations = await page.evaluate(async (namespaces) => {
    const names = (await caches.keys()).filter((name) => name.startsWith('workbox-precache'));
    const requests = (
      await Promise.all(names.map(async (name) => (await caches.open(name)).keys()))
    ).flat();
    return requests
      .filter((request) =>
        new RegExp(
          `/(${namespaces.map((file) => file.replace('.json', '')).join('|')})-[^/]+\\.json`
        ).test(request.url)
      )
      .map((request) => request.url);
  }, namespaces);
  expect(precachedTranslations).toEqual([]);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByLabel('Langue de l’interface')).toHaveValue('fr');
  await expect(page.getByTestId('offline-banner')).toContainText('Hors ligne');
  await expect(page.getByRole('link', { name: 'Règles', exact: true })).toBeVisible();
  for (const [path, title] of [
    ['/about', 'À propos de depot'],
    ['/privacy', 'Politique de confidentialité'],
    ['/missing-page', 'Page introuvable']
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  }
  await page.goto('/settings');
  await page.getByLabel('Langue de l’interface').selectOption('en');
  await expect(page.getByLabel('Interface language')).toHaveValue('en');
  await expect(page.getByRole('link', { name: 'Rules', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Interface language')).toHaveValue('en');
  for (const [path, title] of [
    ['/about', 'About depot'],
    ['/privacy', 'Privacy Policy'],
    ['/missing-page', 'Page Not Found']
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  }
});
