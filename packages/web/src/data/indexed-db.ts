import type { depot } from '@depot/core';

const DB_NAME = 'depot';
const FACTIONS_OBJECT_STORE_NAME = 'factions';
const ROSTERS_OBJECT_STORE_NAME = 'rosters';
const VERSION = 12; // Increment version for slug-based storage

const getDBConnection = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      const upgradeTransaction = request.transaction;
      if (!db.objectStoreNames.contains(FACTIONS_OBJECT_STORE_NAME)) {
        db.createObjectStore(FACTIONS_OBJECT_STORE_NAME);
      } else {
        upgradeTransaction?.objectStore(FACTIONS_OBJECT_STORE_NAME).clear();
      }
      if (!db.objectStoreNames.contains(ROSTERS_OBJECT_STORE_NAME)) {
        db.createObjectStore(ROSTERS_OBJECT_STORE_NAME, { keyPath: 'id' });
      } else {
        upgradeTransaction?.objectStore(ROSTERS_OBJECT_STORE_NAME).clear();
      }
    };
  });

export const createFaction = async (faction: depot.Faction) => {
  const connection = await getDBConnection();
  const transaction = connection.transaction(FACTIONS_OBJECT_STORE_NAME, 'readwrite');
  const objectStore = transaction.objectStore(FACTIONS_OBJECT_STORE_NAME);
  objectStore.put(faction, faction.slug);
  connection.close();
};

export const destroy = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const getFaction = (factionSlug?: string): Promise<depot.Faction> =>
  new Promise(async (resolve, reject) => {
    if (!factionSlug) {
      return reject('Invalid faction slug provided');
    }

    const connection = await getDBConnection();
    const transaction = connection.transaction(FACTIONS_OBJECT_STORE_NAME, 'readonly');
    transaction.onerror = () => {
      connection.close();
      return reject(transaction.error);
    };

    const objectStore = transaction.objectStore(FACTIONS_OBJECT_STORE_NAME);
    const request = objectStore.get(factionSlug);
    request.onsuccess = () => {
      connection.close();
      return resolve(request.result as depot.Faction);
    };
    request.onerror = () => {
      connection.close();
      return reject(request.error);
    };
  });

export const getFactions = (): Promise<depot.Option[]> =>
  new Promise(async (resolve, reject) => {
    const connection = await getDBConnection();
    const transaction = connection.transaction(FACTIONS_OBJECT_STORE_NAME, 'readonly');
    transaction.onerror = () => {
      connection.close();
      return reject(transaction.error);
    };

    const factions: depot.Option[] = [];
    const objectStore = transaction.objectStore(FACTIONS_OBJECT_STORE_NAME);
    const cursor = objectStore.openCursor();
    cursor.onsuccess = () => {
      const result = cursor.result;
      if (result) {
        factions.push({ id: result.value.id, slug: result.value.slug, name: result.value.name });
        cursor.result.continue();
      } else {
        return resolve(factions);
      }
    };
  });

export const saveRoster = async (roster: depot.Roster) => {
  const connection = await getDBConnection();
  const transaction = connection.transaction(ROSTERS_OBJECT_STORE_NAME, 'readwrite');
  const objectStore = transaction.objectStore(ROSTERS_OBJECT_STORE_NAME);
  objectStore.put(roster);
  connection.close();
};

export const getRoster = (rosterId: string): Promise<depot.Roster> =>
  new Promise(async (resolve, reject) => {
    if (!rosterId) {
      return reject('Invalid rosterId provided');
    }

    const connection = await getDBConnection();
    const transaction = connection.transaction(ROSTERS_OBJECT_STORE_NAME, 'readonly');
    transaction.onerror = () => {
      connection.close();
      return reject(transaction.error);
    };

    const objectStore = transaction.objectStore(ROSTERS_OBJECT_STORE_NAME);
    const request = objectStore.get(rosterId);
    request.onsuccess = () => {
      connection.close();
      return resolve(request.result as depot.Roster);
    };
    request.onerror = () => {
      connection.close();
      return reject(request.error);
    };
  });

export const getAllRosters = (): Promise<depot.Roster[]> =>
  new Promise(async (resolve, reject) => {
    const connection = await getDBConnection();
    const transaction = connection.transaction(ROSTERS_OBJECT_STORE_NAME, 'readonly');
    transaction.onerror = () => {
      connection.close();
      return reject(transaction.error);
    };

    const objectStore = transaction.objectStore(ROSTERS_OBJECT_STORE_NAME);
    const request = objectStore.getAll();
    request.onsuccess = () => {
      connection.close();
      return resolve(request.result as depot.Roster[]);
    };
    request.onerror = () => {
      connection.close();
      return reject(request.error);
    };
  });
