import { expect, test } from '@playwright/test';

test.skip(!process.env.WEB_BASE_URL, 'Nécessite le build servi par Pages');

test('sync navigation bypasses the app shell and private responses stay uncached', async ({
  page,
  context
}) => {
  await page.goto('/factions');
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);
  const response = await page.goto('/api/sync/me');
  expect(response?.status()).toBe(401);
  expect(response?.headers()['content-type']).toContain('application/json');
  expect(await response?.json()).toEqual({ error: 'unauthorized' });
  const privateEntries = () =>
    page.evaluate(async () => {
      const entries = await Promise.all(
        (await caches.keys()).map(async (key) => (await caches.open(key)).keys())
      );
      return entries
        .flat()
        .filter((entry) => new URL(entry.url).pathname.startsWith('/api/sync'))
        .map((entry) => entry.url);
    });
  expect(await privateEntries()).toEqual([]);
  await page.goto('/factions');
  await context.setOffline(true);
  expect((await page.reload())?.ok()).toBe(true);
  const offline = await page.evaluate(async () => {
    try {
      const response = await fetch('/api/sync/me');
      return { status: response.status, body: await response.text() };
    } catch {
      return null;
    }
  });
  expect(offline).toBeNull();
  expect(await privateEntries()).toEqual([]);
  await expect(page.goto('/api/sync/me')).rejects.toThrow();
  await context.setOffline(false);
});
