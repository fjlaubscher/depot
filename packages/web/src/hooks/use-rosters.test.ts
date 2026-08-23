import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { depot } from '@depot/core';
import useRosters from './use-rosters';
import { createMockRoster, mockDatasheet, mockDetachment, mockRoster } from '@/test/mock-data';

// Mock offline storage using vi.hoisted for proper scoping
const mockOfflineStorage = vi.hoisted(() => ({
  getAllRosters: vi.fn(),
  saveRoster: vi.fn(),
  deleteRoster: vi.fn()
}));

vi.mock('../data/offline-storage', () => ({
  offlineStorage: mockOfflineStorage
}));

// The roster load path rehydrates units from the catalog.
const mockCatalog = vi.hoisted(() => ({
  getDatasheet: vi.fn().mockResolvedValue(null),
  getFactionManifest: vi.fn().mockResolvedValue(null)
}));

vi.mock('@/contexts/factions/context', () => ({
  useFactionsContext: () => mockCatalog
}));

describe('useRosters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCatalog.getDatasheet.mockResolvedValue(mockDatasheet);
    mockCatalog.getFactionManifest.mockResolvedValue({
      id: 'SM',
      slug: 'space-marines',
      name: 'Space Marines',
      link: '',
      datasheets: [],
      detachments: [mockDetachment],
      datasheetCount: 0,
      detachmentCount: 1
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with loading state', () => {
    mockOfflineStorage.getAllRosters.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useRosters());

    expect(result.current.loading).toBe(true);
    expect(result.current.rosters).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should load rosters successfully', async () => {
    const mockRosters = [
      createMockRoster({ id: 'roster-1', name: 'Space Marines' }),
      createMockRoster({ id: 'roster-2', name: 'Imperial Guard', factionId: 'IG' })
    ];

    mockOfflineStorage.getAllRosters.mockResolvedValue(mockRosters);

    const { result } = renderHook(() => useRosters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rosters).toEqual(mockRosters);
    expect(result.current.error).toBeNull();
    expect(mockOfflineStorage.getAllRosters).toHaveBeenCalledTimes(1);
  });

  it('should handle loading errors', async () => {
    const error = new Error('Storage error');
    mockOfflineStorage.getAllRosters.mockRejectedValue(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useRosters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rosters).toEqual([]);
    expect(result.current.error).toBe('Storage error');
    expect(consoleSpy).toHaveBeenCalledWith(error);

    consoleSpy.mockRestore();
  });

  it('should handle non-Error exceptions', async () => {
    mockOfflineStorage.getAllRosters.mockRejectedValue('String error');

    const { result } = renderHook(() => useRosters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Unknown error');
  });

  it('should delete roster and reload list', async () => {
    const rosterToKeep = createMockRoster({ id: 'keep-me' });
    const rosterToDelete = createMockRoster({ id: 'delete-me' });
    const initialRosters = [rosterToKeep, rosterToDelete];
    const rostersAfterDelete = [rosterToKeep];

    mockOfflineStorage.getAllRosters
      .mockResolvedValueOnce(initialRosters)
      .mockResolvedValueOnce(rostersAfterDelete);
    mockOfflineStorage.deleteRoster.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRosters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rosters).toEqual(initialRosters);

    await act(async () => {
      await result.current.deleteRoster('delete-me');
    });

    expect(mockOfflineStorage.deleteRoster).toHaveBeenCalledWith('delete-me');
    expect(result.current.rosters).toEqual(rostersAfterDelete);
  });

  it('should duplicate roster with new identifiers and reload list', async () => {
    const originalRoster = createMockRoster({ id: 'original-roster', name: 'Original Roster' });
    let duplicatedRoster: depot.Roster | null = null;

    mockOfflineStorage.getAllRosters
      .mockResolvedValueOnce([originalRoster])
      .mockImplementationOnce(async () => {
        if (!duplicatedRoster) {
          throw new Error('Duplicate roster was not saved');
        }
        return [originalRoster, duplicatedRoster];
      });

    mockOfflineStorage.saveRoster.mockImplementation(async (roster) => {
      duplicatedRoster = roster;
    });

    const { result } = renderHook(() => useRosters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const createdDuplicate = await result.current.duplicateRoster(originalRoster);
      expect(createdDuplicate).toEqual(duplicatedRoster);
    });

    expect(duplicatedRoster).not.toBeNull();
    if (!duplicatedRoster) {
      throw new Error('Duplicate roster was not created');
    }
    const created: depot.Roster = duplicatedRoster;
    expect(created.id).not.toBe(originalRoster.id);
    expect(created.name).toBe('Original Roster (Copy)');
    expect(created.units[0]?.id).not.toBe(originalRoster.units[0]?.id);
    expect(mockOfflineStorage.saveRoster).toHaveBeenCalledWith(created);
    expect(result.current.rosters).toEqual([originalRoster, created]);
  });

  it('should reload list after each operation', async () => {
    const roster = mockRoster;
    mockOfflineStorage.getAllRosters.mockResolvedValue([]);
    mockOfflineStorage.saveRoster.mockResolvedValue(undefined);
    mockOfflineStorage.deleteRoster.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRosters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockOfflineStorage.getAllRosters).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.deleteRoster('roster-id');
    });
    expect(mockOfflineStorage.getAllRosters).toHaveBeenCalledTimes(2);

    await act(async () => {
      await result.current.duplicateRoster(roster);
    });
    expect(mockOfflineStorage.getAllRosters).toHaveBeenCalledTimes(3);
  });

  it('should handle empty roster list', async () => {
    mockOfflineStorage.getAllRosters.mockResolvedValue([]);

    const { result } = renderHook(() => useRosters());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rosters).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
