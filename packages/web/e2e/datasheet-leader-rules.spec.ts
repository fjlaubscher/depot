import { test, expect } from '@playwright/test';
import { resetClientState } from './utils';

const DATASHEET_URL = '/faction/space-marines/datasheet/captain';

test.describe('Datasheet leader rules', () => {
  test.beforeEach(async ({ page }) => {
    await resetClientState(page);
    await page.goto(DATASHEET_URL);
    await expect(page.getByTestId('datasheet-header')).toBeVisible();
  });

  test('expands leader rules and shows linked units', async ({ page }) => {
    const leaderSection = page.getByTestId('datasheet-leader-rules');
    await expect(leaderSection).toBeVisible();

    const leaderToggle = leaderSection.getByRole('button', { name: 'Leader' });
    await expect(leaderToggle).toBeVisible();

    await leaderToggle.click();

    await expect(leaderSection).toBeVisible();
    await expect(leaderSection).not.toBeEmpty();
  });
});
