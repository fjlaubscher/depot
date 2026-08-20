import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { resetClientState, createRoster } from './utils';

const pickAlternateDetachment = async (page: Page) => {
  // DetachmentPicker is a multi-select of toggles; flip on one that isn't selected yet.
  const option = page
    .locator('[data-testid^="detachment-option-"]')
    .filter({ has: page.getByRole('switch', { checked: false }) })
    .first();
  await option.waitFor({ state: 'visible' });
  const label = (await option.locator('span').first().textContent())?.trim() ?? '';
  await option.getByRole('switch').click();
  return { label };
};

test.describe('Roster details', () => {
  test.beforeEach(async ({ page }) => {
    await resetClientState(page);
  });

  test('edits roster details and navigates back to edit view', async ({ page }) => {
    const { rosterEditUrl } = await createRoster(page);
    await page.getByLabel('Edit roster details').click();

    await expect(page).toHaveURL(/\/rosters\/[a-z0-9-]+\/details$/i);

    const updatedName = `Updated ${Date.now()}`;
    await page.getByLabel('Roster Name').fill(updatedName);

    const chosenDetachment = await pickAlternateDetachment(page);
    await page.getByLabel('Save roster details').click();

    await expect(page).toHaveURL(/\/rosters\/[a-z0-9-]+\/edit$/i);
    await expect(page).toHaveURL(rosterEditUrl);
    await expect(page.getByTestId('page-header')).toContainText(updatedName);
    await expect(page.getByTestId('page-header')).toContainText(chosenDetachment.label);
  });

  test('disables saving when the roster name is blank', async ({ page }) => {
    await createRoster(page);
    await page.getByLabel('Edit roster details').click();

    const nameInput = page.getByLabel('Roster Name');
    await nameInput.fill('   ');

    const saveAction = page.getByLabel('Save roster details');
    await expect(saveAction).toBeDisabled();
    await expect(page).toHaveURL(/\/rosters\/[a-z0-9-]+\/details$/i);
  });
});
