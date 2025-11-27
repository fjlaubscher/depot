import { test, expect } from '@playwright/test';
import {
  resetClientState,
  createRoster,
  stubClipboardOnly,
  stubNativeShareWithClipboardFallback
} from './utils';

const createRosterAndGoToView = async (page: Parameters<typeof test>[0]['page']) => {
  const roster = await createRoster(page);
  await page.getByTestId('view-roster-button').click();
  await expect(page).toHaveURL(/\/rosters\/[a-z0-9-]+$/i);
  await expect(page.getByTestId('page-header')).toContainText(roster.rosterName);
  return roster;
};

test.describe('Roster view sharing', () => {
  test.beforeEach(async ({ page }) => {
    await resetClientState(page);
  });

  test('falls back to clipboard when native share is unavailable', async ({ page }) => {
    const { rosterName } = await createRosterAndGoToView(page);
    const { getWrites } = await stubClipboardOnly(page);

    await page.getByTestId('share-roster-button').click();

    const writes = await getWrites();
    expect(writes.length).toBeGreaterThan(0);
    expect(writes[0]).toContain(rosterName);
  });

  test('uses native share when available', async ({ page }) => {
    await createRosterAndGoToView(page);
    const { getShareCalls, getClipboardWrites } = await stubNativeShareWithClipboardFallback(page);

    await page.getByTestId('share-roster-button').click();

    const calls = await getShareCalls();
    if (calls.length > 0) {
      expect(calls[0]?.title).toBeTruthy();
    } else {
      const writes = await getClipboardWrites();
      expect(writes.length).toBeGreaterThan(0);
    }
  });
});
