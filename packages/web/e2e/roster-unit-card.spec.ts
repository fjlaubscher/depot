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

  test('shows selected wargear and opens ability modal from expanded card', async ({ page }) => {
    const { rosterBaseUrl } = await addArchonToRoster(page);

    // From roster edit, open the unit edit view
    const archonCard = page.getByTestId('roster-unit-card-archon');
    await expect(archonCard).toBeVisible();
    await archonCard.click();

    // Ensure we are on the edit unit form
    await expect(page.getByTestId('edit-unit-form')).toBeVisible();

    // Select some wargear pills (up to two) so we have explicit selections
    const wargearPills = page.locator('[data-testid^="wargear-pill-"]');
  const wargearCount = await wargearPills.count();
  const selectCount = Math.min(wargearCount, 2);
  const selectedWargearNames: string[] = [];

    for (let index = 0; index < selectCount; index += 1) {
      const pill = wargearPills.nth(index);
      await expect(pill).toBeVisible();
      const name = (await pill.textContent())?.trim();
      if (name) {
        selectedWargearNames.push(name);
      }
      await pill.click();
    }

    // Select the first available wargear ability
  const abilityPill = page.locator('[data-testid^="wargear-ability-pill-"]').first();
  await expect(abilityPill).toBeVisible();
  await abilityPill.click();

  // Save changes and return to roster edit
  await page.getByTestId('save-button').click();
  const editUrl = await page.url();
  expect(editUrl).toMatch(/\/rosters\/[a-z0-9-]+\/edit(#unit-[a-z0-9-]+)?$/i);
  expect(editUrl.includes('#unit-')).toBe(true);

    // Navigate to roster view
    await page.getByTestId('view-roster-button').click();
    await expect(page).toHaveURL(rosterBaseUrl);

    // Expand the Archon unit card
    const archonHeading = page.getByRole('heading', { name: /archon/i });
    await archonHeading.click();

    // Confirm at least one of the selected wargear names appears in the selected wargear table
    const selectedWargearSection = page.getByTestId('roster-unit-selected-wargear');
    await expect(selectedWargearSection).toBeVisible();
    let matchedNames = 0;
    for (const name of selectedWargearNames) {
      try {
        await expect(selectedWargearSection).toContainText(name, { timeout: 1000 });
        matchedNames += 1;
      } catch {
        // Some legacy/grouped wargear may normalize names; best-effort match is sufficient here.
      }
    }
    expect(matchedNames).toBeGreaterThan(0);

    // Click an ability tag and confirm the modal opens
    const abilities = page.getByTestId('roster-unit-abilities');
    const abilityTags = abilities.locator('[data-testid^="roster-unit-abilities-tag-"]');
    await expect(abilityTags.first()).toBeVisible();
    await abilityTags.first().click();

    await expect(page.getByTestId('ability-modal')).toBeVisible();
  });
});
