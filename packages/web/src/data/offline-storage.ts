import type { depot } from '@depot/core';
import { mergeSettingsWithDefaults } from '@/constants/settings';

// Database configuration constants
const DB_CONFIG = {
  NAME: 'depot-offline',
  VERSION: 4 // Increment version to invalidate legacy id-based caches
} as const;

const STORES = {
  FACTION_INDEX: 'factionIndex',
  FACTIONS: 'factions',
  SETTINGS: 'settings',
  USER_DATA: 'userData',
  ROSTERS: 'rosters'
} as const;

const KEYS = {
  INDEX: 'index',
  SETTINGS: 'settings',
  MY_FACTIONS: 'my-factions',
  DATA_VERSION: 'data-version'
} as const;

const normalizeRoster = (roster: depot.Roster): depot.Roster => {
  const factionSlug = roster.factionSlug ?? roster.faction?.slug ?? roster.factionId;

  return {
    ...roster,
    factionSlug,
    faction: roster.faction
      ? { ...roster.faction, slug: roster.faction.slug ?? factionSlug }
      : roster.faction,
    units: roster.units.map((unit) => ({
      ...unit,
      datasheetSlug: unit.datasheetSlug ?? unit.datasheet.slug
    }))
  };
};

// Database connection with proper error handling
class OfflineStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = () => {
          const db = request.result;
          const upgradeTransaction = request.transaction;

          // Create or reset faction index store
          if (!db.objectStoreNames.contains(STORES.FACTION_INDEX)) {
            db.createObjectStore(STORES.FACTION_INDEX);
          } else {
            upgradeTransaction?.objectStore(STORES.FACTION_INDEX).clear();
          }

          // Create or reset factions store keyed by slug
          if (!db.objectStoreNames.contains(STORES.FACTIONS)) {
            db.createObjectStore(STORES.FACTIONS);
          } else {
            upgradeTransaction?.objectStore(STORES.FACTIONS).clear();
          }

          // Create settings store (preserve existing data)
          if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
            db.createObjectStore(STORES.SETTINGS);
          }

          // Create or reset user data store (my factions etc.)
          if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
            db.createObjectStore(STORES.USER_DATA);
          } else {
            upgradeTransaction?.objectStore(STORES.USER_DATA).clear();
          }

          // Create or reset rosters store (schema change for slug support)
          if (!db.objectStoreNames.contains(STORES.ROSTERS)) {
            db.createObjectStore(STORES.ROSTERS, { keyPath: 'id' });
          } else {
            upgradeTransaction?.objectStore(STORES.ROSTERS).clear();
          }
        };
      });
    }

    return this.dbPromise;
  }

  // Faction Index Operations
  async getFactionIndex(): Promise<depot.Index[] | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.FACTION_INDEX], 'readonly');
      const store = transaction.objectStore(STORES.FACTION_INDEX);

      return new Promise((resolve, reject) => {
        const request = store.get(KEYS.INDEX);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get faction index from IndexedDB:', error);
      return null;
    }
  }

  async setFactionIndex(index: depot.Index[]): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.FACTION_INDEX], 'readwrite');
      const store = transaction.objectStore(STORES.FACTION_INDEX);

      return new Promise((resolve, reject) => {
        const request = store.put(index, KEYS.INDEX);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to set faction index in IndexedDB:', error);
      throw error;
    }
  }

  // Faction Data Operations
  async getFaction(factionSlug: string): Promise<depot.Faction | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.FACTIONS], 'readonly');
      const store = transaction.objectStore(STORES.FACTIONS);

      return new Promise((resolve, reject) => {
        const request = store.get(factionSlug);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to get faction ${factionSlug} from IndexedDB:`, error);
      return null;
    }
  }

  async setFaction(factionSlug: string, faction: depot.Faction): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.FACTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.FACTIONS);

      return new Promise((resolve, reject) => {
        const request = store.put(faction, factionSlug);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to set faction ${factionSlug} in IndexedDB:`, error);
      throw error;
    }
  }

  async getAllCachedFactions(): Promise<depot.Option[]> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.FACTIONS], 'readonly');
      const store = transaction.objectStore(STORES.FACTIONS);

      return new Promise((resolve, reject) => {
        const factions: depot.Option[] = [];
        const request = store.openCursor();

        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            const faction = cursor.value as depot.Faction;
            factions.push({ id: faction.id, slug: faction.slug, name: faction.name });
            cursor.continue();
          } else {
            resolve(factions);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get all cached factions:', error);
      return [];
    }
  }

  async deleteFaction(factionSlug: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.FACTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.FACTIONS);

      return new Promise((resolve, reject) => {
        const request = store.delete(factionSlug);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to delete faction ${factionSlug} from IndexedDB:`, error);
      throw error;
    }
  }

  // Settings Operations
  async getSettings(): Promise<depot.Settings | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.SETTINGS], 'readonly');
      const store = transaction.objectStore(STORES.SETTINGS);

      return new Promise((resolve, reject) => {
        const request = store.get(KEYS.SETTINGS);
        request.onsuccess = () => {
          const storedSettings = request.result as depot.Settings | undefined;
          if (!storedSettings) {
            resolve(null);
            return;
          }
          resolve(mergeSettingsWithDefaults(storedSettings));
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get settings from IndexedDB:', error);
      return null;
    }
  }

  async setSettings(settings: depot.Settings): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.SETTINGS], 'readwrite');
      const store = transaction.objectStore(STORES.SETTINGS);

      return new Promise((resolve, reject) => {
        const request = store.put(mergeSettingsWithDefaults(settings), KEYS.SETTINGS);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to set settings in IndexedDB:', error);
      throw error;
    }
  }

  // My Factions Operations
  async getMyFactions(): Promise<depot.Option[] | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.USER_DATA], 'readonly');
      const store = transaction.objectStore(STORES.USER_DATA);

      return new Promise((resolve, reject) => {
        const request = store.get(KEYS.MY_FACTIONS);
        request.onsuccess = () => {
          const result = request.result as depot.Option[] | undefined;
          if (!result) {
            resolve(null);
            return;
          }

          const normalized = result.map((option) => ({
            ...option,
            slug: option.slug ?? option.id
          }));

          resolve(normalized);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get my factions from IndexedDB:', error);
      return null;
    }
  }

  async setMyFactions(myFactions: depot.Option[]): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.USER_DATA], 'readwrite');
      const store = transaction.objectStore(STORES.USER_DATA);

      return new Promise((resolve, reject) => {
        const request = store.put(myFactions, KEYS.MY_FACTIONS);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to set my factions in IndexedDB:', error);
      throw error;
    }
  }

  async getDataVersion(): Promise<string | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.USER_DATA], 'readonly');
      const store = transaction.objectStore(STORES.USER_DATA);

      return new Promise((resolve, reject) => {
        const request = store.get(KEYS.DATA_VERSION);
        request.onsuccess = () => resolve((request.result as string | undefined) ?? null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get data version from IndexedDB:', error);
      return null;
    }
  }

  async setDataVersion(version: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.USER_DATA], 'readwrite');
      const store = transaction.objectStore(STORES.USER_DATA);

      return new Promise((resolve, reject) => {
        const request = store.put(version, KEYS.DATA_VERSION);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to set data version in IndexedDB:', error);
      throw error;
    }
  }

  // Roster Operations
  async saveRoster(roster: depot.Roster): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.ROSTERS], 'readwrite');
      const store = transaction.objectStore(STORES.ROSTERS);

      return new Promise((resolve, reject) => {
        const request = store.put(normalizeRoster(roster));
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to save roster ${roster.id} in IndexedDB:`, error);
      throw error;
    }
  }

  async getRoster(rosterId: string): Promise<depot.Roster | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.ROSTERS], 'readonly');
      const store = transaction.objectStore(STORES.ROSTERS);

      return new Promise((resolve, reject) => {
        const request = store.get(rosterId);
        request.onsuccess = () => {
          const result = request.result as depot.Roster | undefined;
          resolve(result ? normalizeRoster(result) : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to get roster ${rosterId} from IndexedDB:`, error);
      return null;
    }
  }

  async getAllRosters(): Promise<depot.Roster[]> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.ROSTERS], 'readonly');
      const store = transaction.objectStore(STORES.ROSTERS);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const result = (request.result as depot.Roster[] | undefined)?.map(normalizeRoster) || [];
          resolve(result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get all rosters from IndexedDB:', error);
      return [];
    }
  }

  async deleteRoster(rosterId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.ROSTERS], 'readwrite');
      const store = transaction.objectStore(STORES.ROSTERS);

      return new Promise((resolve, reject) => {
        const request = store.delete(rosterId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to delete roster ${rosterId} from IndexedDB:`, error);
      throw error;
    }
  }

  // Database Management
  async clearFactionData(): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.FACTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.FACTIONS);

      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to clear faction cache from IndexedDB:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(
        [STORES.FACTION_INDEX, STORES.FACTIONS, STORES.SETTINGS, STORES.USER_DATA, STORES.ROSTERS],
        'readwrite'
      );

      const promises = [
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.FACTION_INDEX).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.FACTIONS).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.SETTINGS).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.USER_DATA).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.ROSTERS).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      ];

      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to clear all data from IndexedDB:', error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      // Close existing connections
      if (this.dbPromise) {
        const db = await this.dbPromise;
        db.close();
        this.dbPromise = null;
      }

      // Delete the database
      return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_CONFIG.NAME);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to destroy IndexedDB:', error);
      throw error;
    }
  }

  // Utility method to check if data is stale (could be extended with timestamps)
  async isDataStale(): Promise<boolean> {
    // For now, just check if we have any data
    // In the future, this could check timestamps to determine staleness
    const index = await this.getFactionIndex();
    return !index || index.length === 0;
  }
}

// Export a singleton instance
export const offlineStorage = new OfflineStorage();
