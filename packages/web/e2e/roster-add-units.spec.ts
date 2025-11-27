import { test, expect } from '@playwright/test';
import { resetClientState, createRoster } from './utils';

// Drukhari has fewer datasheets, so the add-units page loads faster/stably in CI.
const FACTION_NAME = 'Drukhari';

const createRosterAndOpenAddUnits = async (page: Parameters<typeof test>[0]['page']) => {
  const roster = await createRoster(page, { factionLabel: FACTION_NAME });
  await page.getByTestId('add-units-button').click();
  await expect(page).toHaveURL(`${roster.rosterBaseUrl}/add-units`);

  return { rosterName: roster.rosterName, rosterEditUrl: roster.rosterEditUrl };
};

test.describe('Roster add units', () => {
  test.beforeEach(async ({ page }) => {
    await resetClientState(page);
  });

  test('queues datasheets and adds them to the roster', async ({ page }) => {
    const { rosterName, rosterEditUrl } = await createRosterAndOpenAddUnits(page);

    const loadingLocator = page.getByTestId('datasheet-loading');
    await loadingLocator.waitFor({ state: 'detached' }).catch(() => {});

    const searchInput = page.getByTestId('datasheet-search');
    await expect(searchInput).toBeVisible({ timeout: 60000 });

    await searchInput.fill('Archon');
    await page.getByTestId('add-datasheet-archon').click();

    await searchInput.fill('Kabalite Warriors');
    await page.getByTestId('add-datasheet-kabalite-warriors').click();

    const reviewButton = page.getByRole('button', { name: /Review Selection/i });
    await expect(reviewButton).toBeVisible();
    await reviewButton.click();

    const summaryDrawer = page.getByTestId('unit-selection-summary');
    await expect(summaryDrawer).toBeVisible();
    await expect(summaryDrawer.getByText('Archon')).toBeVisible();
    await expect(summaryDrawer.getByText('Kabalite Warriors')).toBeVisible();

    await summaryDrawer.getByRole('button', { name: 'Confirm' }).click();

    await expect(page).toHaveURL(rosterEditUrl);
    const editHeader = page.getByTestId('page-header');
    await expect(editHeader).toBeVisible();
    await expect(editHeader).toContainText(rosterName);
    await expect(page.getByTestId('roster-unit-card-archon')).toBeVisible();
    await expect(page.getByTestId('roster-unit-card-kabalite-warriors')).toBeVisible();
  });
});
