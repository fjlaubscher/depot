import { test, expect } from '@playwright/test';

// Assumes generated data includes Space Marines with Blood Angels supplements.
test('supplement tabs filter datasheets', async ({ page }) => {
  await page.goto('/faction/space-marines');

  const tablist = page.getByTestId('supplement-tabs');
  await expect(tablist).toBeVisible();

  const bloodAngelsTab = page.getByTestId('supplement-tab-blood-angels');
  const coreTab = page.getByTestId('supplement-tab-codex');
  const allTab = page.getByTestId('supplement-tab-all');

  await bloodAngelsTab.click();
  const summary = page.getByTestId('supplement-summary');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText(/Blood Angels/i);

  await coreTab.click();
  await expect(summary).toContainText(/core datasheets/i);

  await allTab.click();
  await expect(summary).toBeHidden();
});
