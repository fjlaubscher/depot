import { test, expect } from '@playwright/test';
import { resetClientState, createRoster } from './utils';

const FACTION = 'Drukhari';

const addArchonToRoster = async (page: Parameters<typeof test>[0]['page']) => {
  const roster = await createRoster(page, { factionLabel: FACTION });

  await page.getByTestId('add-units-button').click();
  await expect(page).toHaveURL(`${roster.rosterBaseUrl}/add-units`);

  const searchInput = page.getByTestId('datasheet-search');
  await expect(searchInput).toBeVisible({ timeout: 60000 });
  await searchInput.fill('Archon');
  await page.getByTestId('add-datasheet-archon').click();

  const reviewButton = page.getByRole('button', { name: /Review Selection/i });
  await expect(reviewButton).toBeVisible();
  await reviewButton.click();
  await page.getByTestId('unit-selection-summary').getByRole('button', { name: 'Confirm' }).click();

  await expect(page).toHaveURL(roster.rosterEditUrl);

  return roster;
};

test.describe('Roster unit card view', () => {
  test.beforeEach(async ({ page }) => {
    await resetClientState(page);
  });

  test('expands a unit card to show abilities and keywords', async ({ page }) => {
    const { rosterBaseUrl } = await addArchonToRoster(page);

    await page.getByTestId('view-roster-button').click();
    await expect(page).toHaveURL(rosterBaseUrl);

    const archonHeading = page.getByRole('heading', { name: /archon/i });
    await archonHeading.click();

    const abilities = page.getByTestId('roster-unit-abilities');
    await expect(abilities).toBeVisible();
    await expect(abilities.getByText(/ability|abilities/i)).toBeVisible();
    const abilityTags = abilities.locator('[data-testid^="roster-unit-abilities-tag-"]');
    await expect(abilityTags.first()).toBeVisible();
  });
});
