import type { depot } from '@depot/core';
import { resolveIndexDataVersion } from './index-version';

export interface FactionIndexStorage {
  getFactionIndex: () => Promise<depot.Index[] | null>;
  setFactionIndex: (index: depot.Index[]) => Promise<void>;
  clearFactionData: () => Promise<void>;
  getDataVersion: () => Promise<string | null>;
  setDataVersion: (version: string) => Promise<void>;
}

export interface SyncFactionIndexResult {
  index: depot.Index[];
  dataVersion: string | null;
  updated: boolean;
}

export interface SyncFactionIndexOptions {
  fetchIndex: () => Promise<depot.Index[]>;
  storage: FactionIndexStorage;
  resetOfflineData: () => Promise<void>;
}

export const syncFactionIndex = async ({
  fetchIndex,
  storage,
  resetOfflineData
}: SyncFactionIndexOptions): Promise<SyncFactionIndexResult> => {
  let cachedIndex: depot.Index[] | null = null;
  let cachedIndexDataVersion: string | null = null;

  try {
    cachedIndex = await storage.getFactionIndex();
    cachedIndexDataVersion = resolveIndexDataVersion(cachedIndex);
  } catch (error) {
    console.warn('Failed to read cached faction index.', error);
  }

  let storedDataVersion: string | null = null;
  try {
    storedDataVersion = await storage.getDataVersion();
  } catch (error) {
    console.warn('Failed to read cached data version, forcing reset.', error);
    await resetOfflineData();
    cachedIndex = null;
    cachedIndexDataVersion = null;
    storedDataVersion = null;
  }

  const currentDataVersion = storedDataVersion ?? cachedIndexDataVersion ?? null;

  try {
    const latestIndex = await fetchIndex();
    const latestDataVersion = resolveIndexDataVersion(latestIndex);

    const shouldInvalidateCache =
      Boolean(latestDataVersion) && latestDataVersion !== currentDataVersion;

    if (shouldInvalidateCache) {
      await storage.clearFactionData();
    }

    try {
      await storage.setFactionIndex(latestIndex);
    } catch (cacheError) {
      console.warn('Failed to cache faction index.', cacheError);
    }

    if (latestDataVersion) {
      try {
        await storage.setDataVersion(latestDataVersion);
      } catch (persistError) {
        console.warn('Failed to persist data version marker.', persistError);
      }
    }

    return {
      index: latestIndex,
      dataVersion: latestDataVersion ?? currentDataVersion,
      updated: shouldInvalidateCache
    };
  } catch (error) {
    if (cachedIndex && cachedIndex.length > 0) {
      const effectiveDataVersion = cachedIndexDataVersion ?? storedDataVersion ?? null;

      if (effectiveDataVersion && effectiveDataVersion !== storedDataVersion) {
        try {
          await storage.setDataVersion(effectiveDataVersion);
        } catch (persistError) {
          console.warn('Failed to persist data version marker.', persistError);
        }
      }

      return { index: cachedIndex, dataVersion: effectiveDataVersion, updated: false };
    }

    throw error;
  }
};
