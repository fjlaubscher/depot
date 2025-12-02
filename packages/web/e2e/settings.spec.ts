import { test, expect } from '@playwright/test';

const toggles = [
  { name: 'Forge World Units', testId: 'forge-world-units-toggle', defaultChecked: false },
  { name: 'Legends Units', testId: 'legends-units-toggle', defaultChecked: false },
  { name: 'Unaligned Factions', testId: 'unaligned-factions-toggle', defaultChecked: false },
  { name: 'Show Fluff Text', testId: 'show-fluff-text-toggle', defaultChecked: true },
  {
    name: 'Include Wargear',
    testId: 'include-wargear-toggle',
    defaultChecked: true
  },
  { name: 'Use Native Sharing', testId: 'use-native-sharing-toggle', defaultChecked: true },
  { name: 'Call It What It Is', testId: 'call-it-what-it-is-toggle', defaultChecked: true }
];

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('renders key settings toggles with defaults', async ({ page }) => {
    for (const toggle of toggles) {
      const control = page.getByTestId(toggle.testId);
      await expect(control).toBeVisible();
      await expect(control).toHaveAttribute('aria-checked', String(toggle.defaultChecked));
    }
  });

  test('allows toggling settings', async ({ page }) => {
    const toggle = page.getByTestId('forge-world-units-toggle');

    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  });
});
