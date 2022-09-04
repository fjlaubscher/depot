const DB_NAME = 'depot';
const OBJECT_STORE_NAME = 'data';

const getDBConnection = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(OBJECT_STORE_NAME);
    };
  });

export const init = async (factions: depot.Faction[]) => {
  const connection = await getDBConnection();
  const transaction = connection.transaction(OBJECT_STORE_NAME, 'readwrite');
  const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

  for (let i = 0; i < factions.length; i++) {
    objectStore.add(factions[i], factions[i].id);
  }

  connection.close();
};

export const getFaction = (factionId: string): Promise<depot.Faction> =>
  new Promise(async (resolve, reject) => {
    const connection = await getDBConnection();
    const transaction = connection.transaction(OBJECT_STORE_NAME, 'readonly');
    transaction.onerror = () => {
      connection.close();
      return reject(transaction.error);
    };

    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const request = objectStore.get(factionId);
    request.onsuccess = () => {
      connection.close();
      return resolve(request.result as depot.Faction);
    };
    request.onerror = () => {
      connection.close();
      return reject(request.error);
    };
  });

export const getFactions = (): Promise<Option[]> =>
  new Promise(async (resolve, reject) => {
    const connection = await getDBConnection();
    const transaction = connection.transaction(OBJECT_STORE_NAME, 'readonly');
    transaction.onerror = () => {
      connection.close();
      return reject(transaction.error);
    };

    const factions: Option[] = [];
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const cursor = objectStore.openCursor();
    cursor.onsuccess = () => {
      const result = cursor.result;
      if (result) {
        factions.push({ id: result.value.id, name: result.value.name });
        cursor.result.continue();
      } else {
        return resolve(factions);
      }
    };
  });
