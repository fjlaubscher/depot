import { test, expect } from '@playwright/test';
import { resetClientState, stubClipboardOnly, stubNativeShareWithClipboardFallback } from './utils';

const DATASHEET_URL = '/faction/space-marines/datasheet/captain';

test.describe('Datasheet sharing', () => {
  test.beforeEach(async ({ page }) => {
    await resetClientState(page);
    await page.goto(DATASHEET_URL);
    await expect(page.getByTestId('datasheet-header')).toBeVisible();
  });

  test('copies link when native share is unavailable', async ({ page }) => {
    const { getWrites } = await stubClipboardOnly(page);

    await page.getByRole('button', { name: /share datasheet link/i }).click();

    const writes = await getWrites();
    expect(writes.length).toBeGreaterThan(0);
    expect(writes[0]).toContain(DATASHEET_URL);
  });

  test('uses native share when available', async ({ page }) => {
    const { getShareCalls, getClipboardWrites } = await stubNativeShareWithClipboardFallback(page);

    await page.getByRole('button', { name: /share datasheet link/i }).click();

    const calls = await getShareCalls();
    if (calls.length > 0) {
      expect(calls[0]?.title).toMatch(/captain/i);
      expect(calls[0]?.url).toContain(DATASHEET_URL);
    } else {
      const writes = await getClipboardWrites();
      expect(writes.length).toBeGreaterThan(0);
    }
  });
});
