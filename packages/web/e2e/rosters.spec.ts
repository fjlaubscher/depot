import { test, expect, type Page } from '@playwright/test';

const FACTION_NAME = 'Space Marines';
const DETACHMENT_NAME = 'Gladius Task Force';

const resetClientState = async (page: Page) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('depot-offline');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
    localStorage.clear();
    sessionStorage.clear();
  });
};

const gotoCreateRoster = async (page: Page) => {
  await page.goto('/rosters/create');
  await expect(page.getByRole('heading', { name: 'Create New Roster' })).toBeVisible();
};

const selectFactionAndDetachment = async (page: Page) => {
  await page.getByLabel('Faction').selectOption({ label: FACTION_NAME });
  const detachmentSelect = page.getByLabel('Detachment');
  await detachmentSelect.waitFor({ state: 'visible' });
  await detachmentSelect.selectOption({ label: DETACHMENT_NAME });
};

test.beforeEach(async ({ page }) => {
  await resetClientState(page);
});

test('shows validation toast when roster name is missing', async ({ page }) => {
  await gotoCreateRoster(page);

  const submitButton = page.getByTestId('submit-button');
  await page.getByLabel('Roster Name').fill('   ');
  await selectFactionAndDetachment(page);
  await expect(submitButton).toBeEnabled();

  await submitButton.click();
  await expect(page.getByText('Please enter a roster name.')).toBeVisible();
});

test('enforces positive custom max points', async ({ page }) => {
  await gotoCreateRoster(page);

  await page.getByLabel('Roster Name').fill('Test Incursion');
  await selectFactionAndDetachment(page);
  await page.getByLabel('Max Points').selectOption('custom');

  const maxPointsInput = page.getByTestId('max-points-input');
  await maxPointsInput.evaluate((input) => {
    input.removeAttribute('min');
    input.removeAttribute('required');
  });
  await maxPointsInput.fill('0');

  await page.getByTestId('submit-button').click();
  await expect(page.getByText('Max points must be greater than 0.')).toBeVisible();
});

test('creates a new roster and trims the name', async ({ page }) => {
  await gotoCreateRoster(page);

  const submitButton = page.getByTestId('submit-button');
  await expect(submitButton).toBeDisabled();

  const rawName = '  Integration Roster  ';
  const rosterNameInput = page.getByLabel('Roster Name');
  await rosterNameInput.fill(rawName);
  await expect(submitButton).toBeDisabled();

  await page.getByLabel('Faction').selectOption({ label: FACTION_NAME });
  const detachmentSelect = page.getByLabel('Detachment');
  await detachmentSelect.waitFor({ state: 'visible' });
  await expect(submitButton).toBeDisabled();
  await detachmentSelect.selectOption({ label: DETACHMENT_NAME });
  await expect(submitButton).toBeEnabled();

  await submitButton.click();

  await expect(page).toHaveURL(/\/rosters\/[a-z0-9-]+\/edit$/i);
  await expect(page.getByRole('heading', { name: 'Integration Roster' })).toBeVisible();
});

test('cancel returns to the roster list', async ({ page }) => {
  await gotoCreateRoster(page);

  await page.getByTestId('cancel-button').click();
  await expect(page).toHaveURL(/\/rosters$/);
  await expect(page.getByRole('heading', { name: 'My Rosters' })).toBeVisible();
});
