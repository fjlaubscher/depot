import { test, expect } from '@playwright/test';

// Cadian Heavy Weapons Squad carries the widest stats in the catalogue:
// a `D6+1` damage value and a `SUSTAINED HITS 1` keyword.
const URL = '/faction/astra-militarum/datasheet/cadian-heavy-weapons-squad';

const openWargear = async (page: import('@playwright/test').Page) => {
  await page.goto(URL);

  // The wargear section renders collapsed on small screens.
  const summary = page.locator('details > summary').first();
  await expect(summary).toBeVisible();
  if (await page.locator('details:not([open])').count()) await summary.click();
  const table = page.locator('table').first();
  await expect(table).toBeVisible();
  return table;
};

for (const [name, width] of [
  ['mobile', 375],
  ['desktop', 1280]
] as const) {
  test(`wargear stats stay inside the table at ${name} width`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const table = await openWargear(page);
    await expect(table).toContainText('D6+1');

    const overflowing = await table.evaluate((node) => {
      const right = node.getBoundingClientRect().right;
      return [...node.querySelectorAll('td, th')]
        .filter((cell) => cell.getBoundingClientRect().right > right + 1)
        .map((cell) => cell.textContent?.trim() ?? '');
    });

    expect(overflowing).toEqual([]);
  });
}
