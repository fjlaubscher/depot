import type { depot } from '@depot/core';
import { mergeSettingsWithDefaults } from '@/constants/settings';
import { normalizeDatasheetWargear, normalizeSelectedWargear } from '@/utils/wargear';
import { normalizeSelectedWargearAbilities } from '@/utils/abilities';
import type { CachedFaction } from '@/types/offline';

// Database configuration constants
const DB_CONFIG = {
  NAME: 'depot-offline',
  VERSION: 9 // Force cache destroy/rebuild after offline schema changes
} as const;

const STORES = {
  FACTION_INDEX: 'factionIndex',
  FACTION_MANIFESTS: 'factionManifests',
  DATASHEETS: 'datasheets',
  SETTINGS: 'settings',
  USER_DATA: 'userData',
  ROSTERS: 'rosters',
  COLLECTIONS: 'collections'
} as const;

const KEYS = {
  SETTINGS: 'settings',
  DATA_VERSION: 'data-version'
} as const;

const ensureArray = <T>(value: T[] | undefined): T[] => (Array.isArray(value) ? value : []);
const ensureString = (value: string | undefined): string => value ?? '';

const normalizeDatasheetStructure = (datasheet: depot.Datasheet): depot.Datasheet => {
  const normalized = normalizeDatasheetWargear(datasheet);
  return {
    ...normalized,
    abilities: ensureArray(normalized.abilities),
    keywords: ensureArray(normalized.keywords),
    models: ensureArray(normalized.models),
    options: ensureArray(normalized.options),
    wargear: ensureArray(normalized.wargear),
    unitComposition: ensureArray(normalized.unitComposition),
    modelCosts: ensureArray(normalized.modelCosts),
    stratagems: ensureArray(normalized.stratagems),
    enhancements: ensureArray(normalized.enhancements),
    detachmentAbilities: ensureArray(normalized.detachmentAbilities),
    leaders: ensureArray(normalized.leaders),
    loadout: ensureString(normalized.loadout),
    transport: ensureString(normalized.transport),
    leaderHead: ensureString(normalized.leaderHead),
    leaderFooter: ensureString(normalized.leaderFooter),
    damagedW: ensureString(normalized.damagedW),
    damagedDescription: ensureString(normalized.damagedDescription)
  };
};

const normalizeRoster = (roster: depot.Roster): depot.Roster => {
  const factionSlug = roster.factionSlug ?? roster.faction?.slug ?? roster.factionId;

  return {
    ...roster,
    factionSlug,
    faction: roster.faction
      ? { ...roster.faction, slug: roster.faction.slug ?? factionSlug }
      : roster.faction,
    warlordUnitId: roster.warlordUnitId ?? null,
    units: roster.units.map((unit) => {
      const normalizedDatasheet = normalizeDatasheetStructure(unit.datasheet);
      return {
        ...unit,
        datasheet: normalizedDatasheet,
        selectedWargear: normalizeSelectedWargear(
          unit.selectedWargear,
          normalizedDatasheet.wargear
        ),
        selectedWargearAbilities: normalizeSelectedWargearAbilities(
          unit.selectedWargearAbilities,
          normalizedDatasheet.abilities
        ),
        datasheetSlug: unit.datasheetSlug ?? normalizedDatasheet.slug
      };
    })
  };
};

const normalizeCollection = (collection: depot.Collection): depot.Collection => {
  const factionSlug = collection.factionSlug ?? collection.faction?.slug ?? collection.factionId;

  return {
    ...collection,
    factionSlug,
    faction: collection.faction
      ? { ...collection.faction, slug: collection.faction.slug ?? factionSlug }
      : collection.faction,
    items: collection.items.map((item) => {
      const normalizedDatasheet = normalizeDatasheetStructure(item.datasheet);
      return {
        ...item,
        datasheet: normalizedDatasheet,
        selectedWargear: normalizeSelectedWargear(
          item.selectedWargear,
          normalizedDatasheet.wargear
        ),
        selectedWargearAbilities: normalizeSelectedWargearAbilities(
          item.selectedWargearAbilities,
          normalizedDatasheet.abilities
        ),
        datasheetSlug: item.datasheetSlug ?? normalizedDatasheet.slug
      };
    }),
    points: {
      current:
        collection.points?.current ??
        collection.items.reduce(
          (total, item) => total + (parseInt(item.modelCost.cost, 10) || 0),
          0
        )
    }
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
          if (db.objectStoreNames.contains(STORES.FACTION_INDEX)) {
            db.deleteObjectStore(STORES.FACTION_INDEX);
          }
          db.createObjectStore(STORES.FACTION_INDEX, { keyPath: 'slug' });

          // Create or reset faction manifests store keyed by slug
          if (!db.objectStoreNames.contains(STORES.FACTION_MANIFESTS)) {
            db.createObjectStore(STORES.FACTION_MANIFESTS);
          } else {
            upgradeTransaction?.objectStore(STORES.FACTION_MANIFESTS).clear();
          }

          // Create or reset datasheets store keyed by datasheet id
          if (!db.objectStoreNames.contains(STORES.DATASHEETS)) {
            db.createObjectStore(STORES.DATASHEETS);
          } else {
            upgradeTransaction?.objectStore(STORES.DATASHEETS).clear();
          }

          // Drop legacy factions store when upgrading
          if (db.objectStoreNames.contains('factions')) {
            db.deleteObjectStore('factions');
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

          // Create or reset collections store
          if (!db.objectStoreNames.contains(STORES.COLLECTIONS)) {
            db.createObjectStore(STORES.COLLECTIONS, { keyPath: 'id' });
          } else {
            upgradeTransaction?.objectStore(STORES.COLLECTIONS).clear();
          }
        };
      });
    }

    return this.dbPromise;
  }

  /**
   * Ensures the requested object store exists; if not, reset the DB and recreate.
   * Limits retries to avoid infinite recursion if the store cannot be created.
   */
  private async getDBWithStore(
    storeName: (typeof STORES)[keyof typeof STORES],
    retryCount = 0
  ): Promise<IDBDatabase> {
    const MAX_RETRIES = 2;
    const db = await this.getDB();
    if (db.objectStoreNames.contains(storeName)) {
      return db;
    }

    if (retryCount >= MAX_RETRIES) {
      throw new Error(
        `IndexedDB store "${storeName}" missing after ${MAX_RETRIES} retries. Database may be in an invalid state.`
      );
    }

    console.warn(
      `IndexedDB missing store ${storeName}, resetting database (attempt ${retryCount + 1}).`
    );
    await this.destroy();
    const newDb = await this.getDB();
    if (newDb.objectStoreNames.contains(storeName)) {
      return newDb;
    }

    return this.getDBWithStore(storeName, retryCount + 1);
  }

  // Faction Index Operations
  async getFactionIndex(): Promise<depot.Index[] | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.FACTION_INDEX], 'readonly');
      const store = transaction.objectStore(STORES.FACTION_INDEX);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const result = request.result as (depot.Index | depot.Index[] | undefined)[] | undefined;
          if (!result || result.length === 0) {
            resolve(null);
            return;
          }

          // Handle legacy single-entry array shape
          const [first] = result;
          if (Array.isArray(first)) {
            resolve(first);
            return;
          }

          resolve(result.filter((entry): entry is depot.Index => !Array.isArray(entry)));
        };
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
        const clearRequest = store.clear();
        clearRequest.onerror = () => reject(clearRequest.error);
        clearRequest.onsuccess = () => {
          Promise.all(
            index.map(
              (faction) =>
                new Promise<void>((putResolve, putReject) => {
                  const request = store.put(faction);
                  request.onsuccess = () => putResolve();
                  request.onerror = () => putReject(request.error);
                })
            )
          )
            .then(() => resolve())
            .catch(reject);
        };
      });
    } catch (error) {
      console.error('Failed to set faction index in IndexedDB:', error);
      throw error;
    }
  }

  // Faction Data Operations
  async getFactionManifest(factionSlug: string): Promise<depot.FactionManifest | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.FACTION_MANIFESTS], 'readonly');
      const store = transaction.objectStore(STORES.FACTION_MANIFESTS);

      return new Promise((resolve, reject) => {
        const request = store.get(factionSlug);
        request.onsuccess = () => resolve((request.result as depot.FactionManifest) ?? null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to get manifest for ${factionSlug} from IndexedDB:`, error);
      return null;
    }
  }

  async setFactionManifest(factionSlug: string, manifest: depot.FactionManifest): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.FACTION_MANIFESTS], 'readwrite');
      const store = transaction.objectStore(STORES.FACTION_MANIFESTS);

      return new Promise((resolve, reject) => {
        const request = store.put(manifest, factionSlug);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to set manifest for ${factionSlug} in IndexedDB:`, error);
      throw error;
    }
  }

  async getDatasheet(datasheetId: string): Promise<depot.Datasheet | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.DATASHEETS], 'readonly');
      const store = transaction.objectStore(STORES.DATASHEETS);

      return new Promise((resolve, reject) => {
        const request = store.get(datasheetId);
        request.onsuccess = () => {
          const result = request.result as depot.Datasheet | undefined;
          resolve(result ? normalizeDatasheetStructure(result) : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to get datasheet ${datasheetId} from IndexedDB:`, error);
      return null;
    }
  }

  async setDatasheet(datasheet: depot.Datasheet): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORES.DATASHEETS], 'readwrite');
      const store = transaction.objectStore(STORES.DATASHEETS);

      return new Promise((resolve, reject) => {
        const request = store.put(normalizeDatasheetStructure(datasheet), datasheet.id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to set datasheet ${datasheet.id} in IndexedDB:`, error);
      throw error;
    }
  }

  // Collections
  async getCollections(): Promise<depot.Collection[]> {
    try {
      const db = await this.getDBWithStore(STORES.COLLECTIONS);
      const transaction = db.transaction([STORES.COLLECTIONS], 'readonly');
      const store = transaction.objectStore(STORES.COLLECTIONS);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const result = (request.result as depot.Collection[] | undefined) ?? [];
          resolve(result.map((collection) => normalizeCollection(collection)));
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get collections from IndexedDB:', error);
      return [];
    }
  }

  async getCollection(id: string): Promise<depot.Collection | null> {
    try {
      const db = await this.getDBWithStore(STORES.COLLECTIONS);
      const transaction = db.transaction([STORES.COLLECTIONS], 'readonly');
      const store = transaction.objectStore(STORES.COLLECTIONS);

      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
          const result = request.result as depot.Collection | undefined;
          resolve(result ? normalizeCollection(result) : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to get collection ${id} from IndexedDB:`, error);
      return null;
    }
  }

  async saveCollection(collection: depot.Collection): Promise<void> {
    try {
      const db = await this.getDBWithStore(STORES.COLLECTIONS);
      const transaction = db.transaction([STORES.COLLECTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.COLLECTIONS);

      return new Promise((resolve, reject) => {
        const request = store.put(normalizeCollection(collection));
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to save collection ${collection.id} in IndexedDB:`, error);
      throw error;
    }
  }

  async deleteCollection(id: string): Promise<void> {
    try {
      const db = await this.getDBWithStore(STORES.COLLECTIONS);
      const transaction = db.transaction([STORES.COLLECTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.COLLECTIONS);

      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to delete collection ${id} from IndexedDB:`, error);
      throw error;
    }
  }

  async getAllCachedFactions(): Promise<CachedFaction[]> {
    try {
      const db = await this.getDB();
      const manifestsPromise = new Promise<depot.FactionManifest[]>((resolve, reject) => {
        const transaction = db.transaction([STORES.FACTION_MANIFESTS], 'readonly');
        const store = transaction.objectStore(STORES.FACTION_MANIFESTS);
        const request = store.getAll();
        request.onsuccess = () =>
          resolve((request.result as depot.FactionManifest[] | undefined) ?? []);
        request.onerror = () => reject(request.error);
      });

      const datasheetsPromise = new Promise<depot.Datasheet[]>((resolve, reject) => {
        const transaction = db.transaction([STORES.DATASHEETS], 'readonly');
        const store = transaction.objectStore(STORES.DATASHEETS);
        const request = store.getAll();
        request.onsuccess = () => resolve((request.result as depot.Datasheet[] | undefined) ?? []);
        request.onerror = () => reject(request.error);
      });

      const [manifests, datasheets] = await Promise.all([manifestsPromise, datasheetsPromise]);
      const datasheetCountByFaction = datasheets.reduce<Record<string, number>>((acc, sheet) => {
        const factionSlug = sheet.factionSlug || sheet.factionId;
        if (!factionSlug) {
          return acc;
        }
        acc[factionSlug] = (acc[factionSlug] ?? 0) + 1;
        return acc;
      }, {});

      const factions: CachedFaction[] = manifests.map((manifest) => ({
        id: manifest.id,
        slug: manifest.slug,
        name: manifest.name,
        cachedDatasheets: datasheetCountByFaction[manifest.slug] ?? 0
      }));

      return factions;
    } catch (error) {
      console.error('Failed to get all cached factions:', error);
      return [];
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
      const transaction = db.transaction(
        [STORES.FACTION_INDEX, STORES.FACTION_MANIFESTS, STORES.DATASHEETS],
        'readwrite'
      );

      const clearStore = (storeName: (typeof STORES)[keyof typeof STORES]) =>
        new Promise<void>((resolve, reject) => {
          const store = transaction.objectStore(storeName);
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

      await Promise.all([
        clearStore(STORES.FACTION_INDEX),
        clearStore(STORES.FACTION_MANIFESTS),
        clearStore(STORES.DATASHEETS)
      ]);
    } catch (error) {
      console.error('Failed to clear faction cache from IndexedDB:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      const db = await this.getDB();
      const storesToClear = [
        STORES.FACTION_INDEX,
        STORES.FACTION_MANIFESTS,
        STORES.DATASHEETS,
        STORES.SETTINGS,
        STORES.USER_DATA,
        STORES.ROSTERS,
        STORES.COLLECTIONS
      ];

      const transaction = db.transaction(storesToClear, 'readwrite');

      const promises = [
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.FACTION_INDEX).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.FACTION_MANIFESTS).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.DATASHEETS).clear();
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
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(STORES.COLLECTIONS).clear();
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

        // Some mocks may not return a real request; guard accordingly
        if (!request) {
          resolve();
          return;
        }

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
