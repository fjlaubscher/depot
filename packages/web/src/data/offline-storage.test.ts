import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { offlineStorage } from './offline-storage';
import { depot } from '@depot/core';

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn()
};

const mockDatabase = {
  createObjectStore: vi.fn(),
  transaction: vi.fn(),
  close: vi.fn(),
  objectStoreNames: {
    contains: vi.fn()
  }
};

const mockTransaction = {
  objectStore: vi.fn(),
  onerror: null,
  oncomplete: null
};

const mockObjectStore = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  openCursor: vi.fn(),
  getAll: vi.fn()
};

const mockRequest = {
  onsuccess: null as any,
  onerror: null as any,
  onupgradeneeded: null as any,
  result: null as any,
  error: null as any
};

const mockCursor = {
  value: null,
  continue: vi.fn()
};

// Mock data
const mockFactionIndex: depot.Index[] = [
  { id: 'space-marines', name: 'Space Marines', path: '/data/SM.json' },
  { id: 'chaos-space-marines', name: 'Chaos Space Marines', path: '/data/CSM.json' }
];

const mockFaction: depot.Faction = {
  id: 'space-marines',
  name: 'Space Marines',
  link: 'https://wahapedia.ru/wh40k10ed/factions/space-marines',
  datasheets: [],
  stratagems: [],
  enhancements: [],
  detachmentAbilities: []
};

const mockSettings: depot.Settings = {
  showForgeWorld: false,
  showLegends: true
};

describe('OfflineStorage', () => {
  beforeEach(() => {
    // Setup IndexedDB mock
    global.indexedDB = mockIndexedDB as any;

    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock behaviors
    mockIndexedDB.open.mockImplementation(() => {
      const request = { ...mockRequest };
      setTimeout(() => {
        if (request.onupgradeneeded) {
          mockDatabase.objectStoreNames.contains.mockReturnValue(false);
          request.result = mockDatabase;
          request.onupgradeneeded();
        }
        if (request.onsuccess) {
          request.result = mockDatabase;
          request.onsuccess();
        }
      }, 0);
      return request;
    });

    mockDatabase.transaction.mockReturnValue(mockTransaction);
    mockTransaction.objectStore.mockReturnValue(mockObjectStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getFactionIndex', () => {
    it('should return faction index from IndexedDB', async () => {
      mockObjectStore.get.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.result = mockFactionIndex;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const result = await offlineStorage.getFactionIndex();

      expect(result).toEqual(mockFactionIndex);
      expect(mockObjectStore.get).toHaveBeenCalledWith('index');
    });

    it('should return null when no index exists', async () => {
      mockObjectStore.get.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.result = undefined;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const result = await offlineStorage.getFactionIndex();

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      mockIndexedDB.open.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.error = new Error('Database error');
          if (request.onerror) request.onerror();
        }, 0);
        return request;
      });

      const result = await offlineStorage.getFactionIndex();

      expect(result).toBeNull();
    });
  });

  describe('setFactionIndex', () => {
    it('should store faction index in IndexedDB', async () => {
      mockObjectStore.put.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      await expect(offlineStorage.setFactionIndex(mockFactionIndex)).resolves.toBeUndefined();

      expect(mockObjectStore.put).toHaveBeenCalledWith(mockFactionIndex, 'index');
    });

    it('should throw error on storage failure', async () => {
      mockObjectStore.put.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.error = new Error('Storage error');
          if (request.onerror) request.onerror();
        }, 0);
        return request;
      });

      await expect(offlineStorage.setFactionIndex(mockFactionIndex)).rejects.toThrow();
    });
  });

  describe('getFaction', () => {
    it('should return faction from IndexedDB', async () => {
      mockObjectStore.get.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.result = mockFaction;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const result = await offlineStorage.getFaction('space-marines');

      expect(result).toEqual(mockFaction);
      expect(mockObjectStore.get).toHaveBeenCalledWith('space-marines');
    });

    it('should return null when faction does not exist', async () => {
      mockObjectStore.get.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.result = undefined;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const result = await offlineStorage.getFaction('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('setFaction', () => {
    it('should store faction in IndexedDB', async () => {
      mockObjectStore.put.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      await expect(
        offlineStorage.setFaction('space-marines', mockFaction)
      ).resolves.toBeUndefined();

      expect(mockObjectStore.put).toHaveBeenCalledWith(mockFaction, 'space-marines');
    });
  });

  describe('getAllCachedFactions', () => {
    it('should return list of cached factions', async () => {
      mockObjectStore.openCursor.mockImplementation(() => {
        const request = { ...mockRequest };
        let callCount = 0;
        setTimeout(() => {
          if (request.onsuccess) {
            if (callCount === 0) {
              request.result = {
                ...mockCursor,
                value: mockFaction,
                continue: vi.fn(() => {
                  callCount++;
                  setTimeout(() => {
                    request.result = null;
                    if (request.onsuccess) request.onsuccess();
                  }, 0);
                })
              };
              request.onsuccess();
            } else {
              request.result = null;
              request.onsuccess();
            }
          }
        }, 0);
        return request;
      });

      const result = await offlineStorage.getAllCachedFactions();

      expect(result).toEqual([{ id: 'space-marines', name: 'Space Marines' }]);
    });
  });

  describe('getSettings', () => {
    it('should return settings from IndexedDB', async () => {
      mockObjectStore.get.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.result = mockSettings;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const result = await offlineStorage.getSettings();

      expect(result).toEqual(mockSettings);
      expect(mockObjectStore.get).toHaveBeenCalledWith('settings');
    });
  });

  describe('setSettings', () => {
    it('should store settings in IndexedDB', async () => {
      mockObjectStore.put.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      await expect(offlineStorage.setSettings(mockSettings)).resolves.toBeUndefined();

      expect(mockObjectStore.put).toHaveBeenCalledWith(mockSettings, 'settings');
    });
  });

  describe('clearAllData', () => {
    it('should clear all data from all stores', async () => {
      mockObjectStore.clear.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      await expect(offlineStorage.clearAllData()).resolves.toBeUndefined();

      expect(mockObjectStore.clear).toHaveBeenCalledTimes(5);
    });
  });

  describe('destroy', () => {
    it('should delete the database', async () => {
      mockIndexedDB.deleteDatabase.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      await expect(offlineStorage.destroy()).resolves.toBeUndefined();

      expect(mockDatabase.close).toHaveBeenCalled();
      expect(mockIndexedDB.deleteDatabase).toHaveBeenCalledWith('depot-offline');
    });
  });

  describe('Roster Operations', () => {
    const mockRoster = {
      id: 'test-roster',
      name: 'Test Roster',
      factionId: 'SM',
      detachment: {
        name: 'Test Detachment',
        abilities: [],
        enhancements: [],
        stratagems: []
      },
      points: { current: 0, max: 2000 },
      units: [],
      enhancements: []
    };

    it('should save roster to IndexedDB', async () => {
      mockObjectStore.put.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      await expect(offlineStorage.saveRoster(mockRoster)).resolves.toBeUndefined();
      expect(mockObjectStore.put).toHaveBeenCalledWith(mockRoster);
    });

    it('should get roster from IndexedDB', async () => {
      mockObjectStore.get.mockImplementation(() => {
        const request = { ...mockRequest, result: mockRoster };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const result = await offlineStorage.getRoster('test-roster');
      expect(result).toEqual(mockRoster);
      expect(mockObjectStore.get).toHaveBeenCalledWith('test-roster');
    });

    it('should return null when roster does not exist', async () => {
      mockObjectStore.get.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const result = await offlineStorage.getRoster('non-existent');
      expect(result).toBeNull();
    });

    it('should get all rosters from IndexedDB', async () => {
      const mockRosters = [mockRoster, { ...mockRoster, id: 'roster-2' }];

      mockObjectStore.getAll.mockImplementation(() => {
        const request = { ...mockRequest, result: mockRosters };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const result = await offlineStorage.getAllRosters();
      expect(result).toEqual(mockRosters);
    });

    it('should return empty array when no rosters exist', async () => {
      mockObjectStore.getAll.mockImplementation(() => {
        const request = { ...mockRequest, result: [] };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const result = await offlineStorage.getAllRosters();
      expect(result).toEqual([]);
    });

    it('should delete roster from IndexedDB', async () => {
      mockObjectStore.delete.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      await expect(offlineStorage.deleteRoster('test-roster')).resolves.toBeUndefined();
      expect(mockObjectStore.delete).toHaveBeenCalledWith('test-roster');
    });

    it('should handle roster save errors', async () => {
      mockObjectStore.put.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          if (request.onerror) request.onerror();
        }, 0);
        return request;
      });

      await expect(offlineStorage.saveRoster(mockRoster)).rejects.toThrow();
    });

    it('should handle roster retrieval errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock a database transaction error
      mockTransaction.objectStore.mockImplementation(() => {
        throw new Error('DB Error');
      });

      const result = await offlineStorage.getRoster('error-roster');
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to get roster error-roster from IndexedDB:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle getAllRosters errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock a database transaction error
      mockTransaction.objectStore.mockImplementation(() => {
        throw new Error('DB Error');
      });

      const result = await offlineStorage.getAllRosters();
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to get all rosters from IndexedDB:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('isDataStale', () => {
    it('should return true when no index exists', async () => {
      mockObjectStore.get.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.result = null;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const result = await offlineStorage.isDataStale();

      expect(result).toBe(true);
    });

    it('should return false when index exists', async () => {
      mockObjectStore.get.mockImplementation(() => {
        const request = { ...mockRequest };
        setTimeout(() => {
          request.result = mockFactionIndex;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const result = await offlineStorage.isDataStale();

      expect(result).toBe(false);
    });
  });
});
