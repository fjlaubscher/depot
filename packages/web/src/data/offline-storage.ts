import type { depot } from '@depot/core';
import { mergeSettingsWithDefaults } from '@/constants/settings';
import { normalizeDatasheetWargear, normalizeSelectedWargear } from '@depot/core/utils/wargear';
import { normalizeSelectedWargearAbilities } from '@depot/core/utils/abilities';
import type { CachedFaction } from '@/types/offline';

// Database configuration constants
const DB_CONFIG = {
  NAME: 'depot-offline',
  VERSION: 10 // Force cache destroy/rebuild after offline schema changes
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
  DATA_VERSION: 'data-version',
  BOOKMARKS: 'bookmarks'
} as const;

const stampTimestamps = <T extends { createdAt?: string; updatedAt?: string }>(
  entity: T
): T & { createdAt: string; updatedAt: string } => {
  const now = new Date().toISOString();
  return {
    ...entity,
    createdAt: entity.createdAt ?? now,
    updatedAt: now
  };
};

const req = <T>(r: IDBRequest<T>): Promise<T> =>
  new Promise<T>((res, rej) => {
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });

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
    dataVersion: roster.dataVersion ?? null,
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
    dataVersion: collection.dataVersion ?? null,
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

  private async store(
    storeName: (typeof STORES)[keyof typeof STORES],
    mode: IDBTransactionMode = 'readonly'
  ): Promise<IDBObjectStore> {
    const db = await this.getDB();
    return db.transaction([storeName], mode).objectStore(storeName);
  }

  // Faction Index Operations
  async getFactionIndex(): Promise<depot.Index[] | null> {
    try {
      const store = await this.store(STORES.FACTION_INDEX);
      const result = (await req(store.getAll())) as depot.Index[] | undefined;
      return result && result.length > 0 ? result : null;
    } catch (error) {
      console.error('Failed to get faction index from IndexedDB:', error);
      return null;
    }
  }

  async setFactionIndex(index: depot.Index[]): Promise<void> {
    try {
      const store = await this.store(STORES.FACTION_INDEX, 'readwrite');
      await req(store.clear());
      await Promise.all(index.map((faction) => req(store.put(faction))));
    } catch (error) {
      console.error('Failed to set faction index in IndexedDB:', error);
      throw error;
    }
  }

  // Faction Data Operations
  async getFactionManifest(factionSlug: string): Promise<depot.FactionManifest | null> {
    try {
      const store = await this.store(STORES.FACTION_MANIFESTS);
      return ((await req(store.get(factionSlug))) as depot.FactionManifest | undefined) ?? null;
    } catch (error) {
      console.error(`Failed to get manifest for ${factionSlug} from IndexedDB:`, error);
      return null;
    }
  }

  async setFactionManifest(factionSlug: string, manifest: depot.FactionManifest): Promise<void> {
    try {
      const store = await this.store(STORES.FACTION_MANIFESTS, 'readwrite');
      await req(store.put(manifest, factionSlug));
    } catch (error) {
      console.error(`Failed to set manifest for ${factionSlug} in IndexedDB:`, error);
      throw error;
    }
  }

  async getDatasheet(datasheetId: string): Promise<depot.Datasheet | null> {
    try {
      const store = await this.store(STORES.DATASHEETS);
      return ((await req(store.get(datasheetId))) as depot.Datasheet | undefined) ?? null;
    } catch (error) {
      console.error(`Failed to get datasheet ${datasheetId} from IndexedDB:`, error);
      return null;
    }
  }

  async setDatasheet(datasheet: depot.Datasheet): Promise<void> {
    try {
      const store = await this.store(STORES.DATASHEETS, 'readwrite');
      await req(store.put(normalizeDatasheetStructure(datasheet), datasheet.id));
    } catch (error) {
      console.error(`Failed to set datasheet ${datasheet.id} in IndexedDB:`, error);
      throw error;
    }
  }

  // Collections
  async getCollections(): Promise<depot.Collection[]> {
    try {
      const store = await this.store(STORES.COLLECTIONS);
      return ((await req(store.getAll())) as depot.Collection[] | undefined) ?? [];
    } catch (error) {
      console.error('Failed to get collections from IndexedDB:', error);
      return [];
    }
  }

  async getCollection(id: string): Promise<depot.Collection | null> {
    try {
      const store = await this.store(STORES.COLLECTIONS);
      return ((await req(store.get(id))) as depot.Collection | undefined) ?? null;
    } catch (error) {
      console.error(`Failed to get collection ${id} from IndexedDB:`, error);
      return null;
    }
  }

  async saveCollection(collection: depot.Collection): Promise<void> {
    try {
      const store = await this.store(STORES.COLLECTIONS, 'readwrite');
      await req(store.put(stampTimestamps(normalizeCollection(collection))));
    } catch (error) {
      console.error(`Failed to save collection ${collection.id} in IndexedDB:`, error);
      throw error;
    }
  }

  async deleteCollection(id: string): Promise<void> {
    try {
      const store = await this.store(STORES.COLLECTIONS, 'readwrite');
      await req(store.delete(id));
    } catch (error) {
      console.error(`Failed to delete collection ${id} from IndexedDB:`, error);
      throw error;
    }
  }

  async getAllCachedFactions(): Promise<CachedFaction[]> {
    try {
      const [manifests, datasheets] = await Promise.all([
        this.store(STORES.FACTION_MANIFESTS).then(
          (store) => req(store.getAll()) as Promise<depot.FactionManifest[]>
        ),
        this.store(STORES.DATASHEETS).then(
          (store) => req(store.getAll()) as Promise<depot.Datasheet[]>
        )
      ]);

      const datasheetCountByFaction = (datasheets ?? []).reduce<Record<string, number>>(
        (acc, sheet) => {
          const factionSlug = sheet.factionSlug || sheet.factionId;
          if (!factionSlug) {
            return acc;
          }
          acc[factionSlug] = (acc[factionSlug] ?? 0) + 1;
          return acc;
        },
        {}
      );

      return (manifests ?? []).map((manifest) => ({
        id: manifest.id,
        slug: manifest.slug,
        name: manifest.name,
        cachedDatasheets: datasheetCountByFaction[manifest.slug] ?? 0
      }));
    } catch (error) {
      console.error('Failed to get all cached factions:', error);
      return [];
    }
  }

  // Settings Operations
  async getSettings(): Promise<depot.Settings | null> {
    try {
      const store = await this.store(STORES.SETTINGS);
      const storedSettings = (await req(store.get(KEYS.SETTINGS))) as depot.Settings | undefined;
      return storedSettings ? mergeSettingsWithDefaults(storedSettings) : null;
    } catch (error) {
      console.error('Failed to get settings from IndexedDB:', error);
      return null;
    }
  }

  async setSettings(settings: depot.Settings): Promise<void> {
    try {
      const store = await this.store(STORES.SETTINGS, 'readwrite');
      await req(store.put(mergeSettingsWithDefaults(settings), KEYS.SETTINGS));
    } catch (error) {
      console.error('Failed to set settings in IndexedDB:', error);
      throw error;
    }
  }

  async getDataVersion(): Promise<string | null> {
    try {
      const store = await this.store(STORES.USER_DATA);
      return ((await req(store.get(KEYS.DATA_VERSION))) as string | undefined) ?? null;
    } catch (error) {
      console.error('Failed to get data version from IndexedDB:', error);
      return null;
    }
  }

  async setDataVersion(version: string): Promise<void> {
    try {
      const store = await this.store(STORES.USER_DATA, 'readwrite');
      await req(store.put(version, KEYS.DATA_VERSION));
    } catch (error) {
      console.error('Failed to set data version in IndexedDB:', error);
      throw error;
    }
  }

  // Bookmark Operations (USER_DATA key-value)
  async getBookmarks(): Promise<depot.Bookmark[]> {
    try {
      const store = await this.store(STORES.USER_DATA);
      const stored = (await req(store.get(KEYS.BOOKMARKS))) as depot.Bookmark[] | undefined;
      return Array.isArray(stored) ? stored : [];
    } catch (error) {
      console.error('Failed to get bookmarks from IndexedDB:', error);
      return [];
    }
  }

  async setBookmarks(bookmarks: depot.Bookmark[]): Promise<void> {
    try {
      const store = await this.store(STORES.USER_DATA, 'readwrite');
      await req(store.put(bookmarks, KEYS.BOOKMARKS));
    } catch (error) {
      console.error('Failed to set bookmarks in IndexedDB:', error);
      throw error;
    }
  }

  async addBookmark(bookmark: depot.Bookmark): Promise<void> {
    const existing = await this.getBookmarks();
    if (existing.some((entry) => entry.id === bookmark.id)) {
      return;
    }
    await this.setBookmarks([bookmark, ...existing]);
  }

  async removeBookmark(id: string): Promise<void> {
    const existing = await this.getBookmarks();
    await this.setBookmarks(existing.filter((entry) => entry.id !== id));
  }

  /** Returns true when the bookmark is present after the toggle. */
  async toggleBookmark(bookmark: depot.Bookmark): Promise<boolean> {
    const existing = await this.getBookmarks();
    const isPresent = existing.some((entry) => entry.id === bookmark.id);
    if (isPresent) {
      await this.setBookmarks(existing.filter((entry) => entry.id !== bookmark.id));
      return false;
    }
    await this.setBookmarks([bookmark, ...existing]);
    return true;
  }

  // Roster Operations
  async saveRoster(roster: depot.Roster): Promise<void> {
    try {
      const store = await this.store(STORES.ROSTERS, 'readwrite');
      await req(store.put(stampTimestamps(normalizeRoster(roster))));
    } catch (error) {
      console.error(`Failed to save roster ${roster.id} in IndexedDB:`, error);
      throw error;
    }
  }

  async getRoster(rosterId: string): Promise<depot.Roster | null> {
    try {
      const store = await this.store(STORES.ROSTERS);
      return ((await req(store.get(rosterId))) as depot.Roster | undefined) ?? null;
    } catch (error) {
      console.error(`Failed to get roster ${rosterId} from IndexedDB:`, error);
      return null;
    }
  }

  async getAllRosters(): Promise<depot.Roster[]> {
    try {
      const store = await this.store(STORES.ROSTERS);
      return ((await req(store.getAll())) as depot.Roster[] | undefined) ?? [];
    } catch (error) {
      console.error('Failed to get all rosters from IndexedDB:', error);
      return [];
    }
  }

  async deleteRoster(rosterId: string): Promise<void> {
    try {
      const store = await this.store(STORES.ROSTERS, 'readwrite');
      await req(store.delete(rosterId));
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

      await Promise.all(
        [STORES.FACTION_INDEX, STORES.FACTION_MANIFESTS, STORES.DATASHEETS].map((storeName) =>
          req(transaction.objectStore(storeName).clear())
        )
      );
    } catch (error) {
      console.error('Failed to clear faction cache from IndexedDB:', error);
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
      const request = indexedDB.deleteDatabase(DB_CONFIG.NAME);

      // Some mocks may not return a real request; guard accordingly
      if (!request) {
        return;
      }

      await req(request);
    } catch (error) {
      console.error('Failed to destroy IndexedDB:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const offlineStorage = new OfflineStorage();
