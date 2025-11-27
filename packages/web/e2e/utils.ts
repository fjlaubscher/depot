import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const DEFAULT_FACTION = 'Drukhari';

export const resetClientState = async (page: Page) => {
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

export const selectFactionAndDetachment = async (
  page: Page,
  factionLabel: string = DEFAULT_FACTION
) => {
  await page.getByLabel('Faction').selectOption({ label: factionLabel });
  const detachmentSelect = page.getByLabel('Detachment');
  await detachmentSelect.waitFor({ state: 'visible' });
  await detachmentSelect.selectOption({ index: 1 });
};

export const createRoster = async (page: Page, options?: { factionLabel?: string }) => {
  await page.goto('/rosters/create');
  await expect(page.getByTestId('page-header')).toBeVisible();

  const rosterName = `E2E Roster ${Date.now()}`;
  await page.getByLabel('Roster Name').fill(rosterName);
  await selectFactionAndDetachment(page, options?.factionLabel ?? DEFAULT_FACTION);

  await page.getByTestId('submit-button').click();
  await expect(page).toHaveURL(/\/rosters\/[a-z0-9-]+\/edit$/i);

  const rosterEditUrl = page.url();
  const rosterBaseUrl = rosterEditUrl.replace(/\/edit$/, '');

  return { rosterName, rosterEditUrl, rosterBaseUrl };
};

export const stubClipboardOnly = async (page: Page) => {
  await page.evaluate(() => {
    const writes: string[] = [];
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          writes.push(text);
        }
      },
      configurable: true
    });
    (window as any).__clipboardWrites = writes;
  });
  const getWrites = () => page.evaluate(() => (window as any).__clipboardWrites as string[]);
  return { getWrites };
};

export const stubNativeShareWithClipboardFallback = async (page: Page) => {
  await page.evaluate(() => {
    const calls: any[] = [];
    const writes: string[] = [];
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          writes.push(text);
        }
      },
      configurable: true
    });
    Object.defineProperty(navigator, 'share', {
      value: async (payload: any) => {
        calls.push(payload);
      },
      configurable: true
    });
    (window as any).__shareCalls = calls;
    (window as any).__clipboardWrites = writes;
  });
  const getShareCalls = () => page.evaluate(() => (window as any).__shareCalls as any[]);
  const getClipboardWrites = () =>
    page.evaluate(() => (window as any).__clipboardWrites as string[]);
  return { getShareCalls, getClipboardWrites };
};

// Simple test fixture for a created roster
export const withRoster = (factionLabel?: string) => ({
  rosterName: '',
  rosterEditUrl: '',
  async use({
    page,
    next
  }: {
    page: Page;
    next: (roster: { rosterName: string; rosterEditUrl: string }) => Promise<void>;
  }) {
    const roster = await createRoster(page, { factionLabel });
    await next({ rosterName: roster.rosterName, rosterEditUrl: roster.rosterEditUrl });
  }
});
