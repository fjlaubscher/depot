import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { resetClientState, createRoster } from './utils';

const pickAlternateDetachment = async (page: Page) => {
  const detachmentSelect = page.getByLabel('Detachment');
  const currentValue = await detachmentSelect.inputValue();
  const options = await detachmentSelect.locator('option').evaluateAll((nodes) =>
    nodes
      .map((option) => ({
        value: option.getAttribute('value') ?? '',
        label: option.textContent?.trim() ?? ''
      }))
      .filter((option) => option.value)
  );

  const nextOption =
    options.find((option) => option.value !== currentValue) ??
    options.find((option) => option.value);

  if (!nextOption) {
    throw new Error('No detachment options available to select');
  }

  await detachmentSelect.selectOption(nextOption.value);
  return nextOption;
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
