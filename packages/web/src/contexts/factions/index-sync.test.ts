import { describe, expect, it, vi } from 'vitest';
import type { depot } from '@depot/core';
import { syncFactionIndex } from './index-sync';

const MOCK_VERSION = '2025-11-29T02:05:23';

const mockIndex: depot.Index[] = [
  {
    id: 'SM',
    slug: 'space-marines',
    name: 'Space Marines',
    path: '/data/sm.json',
    dataVersion: MOCK_VERSION
  }
];

describe('syncFactionIndex', () => {
  it('clears cached faction data when the data version changes', async () => {
    const storage = {
      getFactionIndex: vi.fn().mockResolvedValue(mockIndex),
      setFactionIndex: vi.fn().mockResolvedValue(undefined),
      clearFactionData: vi.fn().mockResolvedValue(undefined),
      getDataVersion: vi.fn().mockResolvedValue('legacy-version'),
      setDataVersion: vi.fn().mockResolvedValue(undefined)
    };

    const fetchIndex = vi.fn().mockResolvedValue(mockIndex);
    const resetOfflineData = vi.fn().mockResolvedValue(undefined);

    const result = await syncFactionIndex({ fetchIndex, storage, resetOfflineData });

    expect(result.updated).toBe(true);
    expect(storage.clearFactionData).toHaveBeenCalled();
    expect(storage.setFactionIndex).toHaveBeenCalledWith(mockIndex);
    expect(storage.setDataVersion).toHaveBeenCalledWith(MOCK_VERSION);
  });

  it('returns cached index when the network request fails', async () => {
    const storage = {
      getFactionIndex: vi.fn().mockResolvedValue(mockIndex),
      setFactionIndex: vi.fn().mockResolvedValue(undefined),
      clearFactionData: vi.fn().mockResolvedValue(undefined),
      getDataVersion: vi.fn().mockResolvedValue(MOCK_VERSION),
      setDataVersion: vi.fn().mockResolvedValue(undefined)
    };

    const fetchIndex = vi.fn().mockRejectedValue(new Error('network down'));
    const resetOfflineData = vi.fn().mockResolvedValue(undefined);

    const result = await syncFactionIndex({ fetchIndex, storage, resetOfflineData });

    expect(result).toEqual({ index: mockIndex, dataVersion: MOCK_VERSION, updated: false });
    expect(storage.setFactionIndex).not.toHaveBeenCalled();
    expect(storage.clearFactionData).not.toHaveBeenCalled();
  });

  it('resets offline storage when reading the stored version throws', async () => {
    const storage = {
      getFactionIndex: vi.fn().mockResolvedValue(mockIndex),
      setFactionIndex: vi.fn().mockResolvedValue(undefined),
      clearFactionData: vi.fn().mockResolvedValue(undefined),
      getDataVersion: vi.fn().mockRejectedValue(new Error('corrupt store')),
      setDataVersion: vi.fn().mockResolvedValue(undefined)
    };

    const fetchIndex = vi.fn().mockResolvedValue(mockIndex);
    const resetOfflineData = vi.fn().mockResolvedValue(undefined);

    const result = await syncFactionIndex({ fetchIndex, storage, resetOfflineData });

    expect(resetOfflineData).toHaveBeenCalled();
    expect(result.index).toEqual(mockIndex);
  });
});
