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
  await page.getByTestId('detachment-field').waitFor({ state: 'visible' });
  await page.locator('[data-testid^="detachment-toggle-"]').first().click();
};

export const createRoster = async (page: Page, options?: { factionLabel?: string }) => {
  await page.goto('/rosters');
  await page.getByRole('button', { name: 'Create new roster' }).click();
  await expect(page.getByTestId('create-roster-sheet')).toBeVisible();

  const rosterName = `E2E Roster ${Date.now()}`;
  await page.getByLabel('Roster Name').fill(rosterName);
  await selectFactionAndDetachment(page, options?.factionLabel ?? DEFAULT_FACTION);

  await page.getByTestId('submit-button').click();
  await expect(page).toHaveURL(/\/rosters\/[a-z0-9-]+\/edit$/i);

  const rosterEditUrl = page.url();
  const rosterBaseUrl = rosterEditUrl.replace(/\/edit$/, '');
  const rosterId = rosterBaseUrl.split('/').pop()!;

  // Landing on /edit does not mean the roster reached IndexedDB. Navigating
  // before the write commits loses it, so wait for it to be readable back.
  await expect
    .poll(() =>
      page.evaluate(
        (id) =>
          new Promise<boolean>((resolve) => {
            const open = indexedDB.open('depot-offline');
            open.onerror = () => resolve(false);
            open.onsuccess = () => {
              const db = open.result;
              if (!Array.from(db.objectStoreNames).includes('rosters')) {
                db.close();
                resolve(false);
                return;
              }
              const get = db.transaction('rosters').objectStore('rosters').get(id);
              get.onsuccess = () => {
                db.close();
                resolve(Boolean(get.result));
              };
              get.onerror = () => {
                db.close();
                resolve(false);
              };
            };
          }),
        rosterId
      )
    )
    .toBe(true);

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
