import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { depot } from '@depot/core';
import useMyFactions from './use-my-factions';
import { offlineStorage } from '../data/offline-storage';
import { mockFactionIndex } from '@/test/mock-data';

// Mock offline storage
vi.mock('../data/offline-storage', () => ({
  offlineStorage: {
    getMyFactions: vi.fn(),
    setMyFactions: vi.fn()
  }
}));

const mockOfflineStorage = vi.mocked(offlineStorage);

describe('useMyFactions', () => {
  const mockMyFactions: depot.Option[] = [
    { id: mockFactionIndex[0].id, name: mockFactionIndex[0].name },
    { id: mockFactionIndex[1].id, name: mockFactionIndex[1].name }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with undefined factions', async () => {
    mockOfflineStorage.getMyFactions.mockResolvedValue(null);

    const { result } = renderHook(() => useMyFactions());

    expect(result.current[0]).toBeUndefined();
    
    // Wait for the async effect to complete
    await waitFor(() => {
      expect(result.current[0]).toBeUndefined();
    });
  });

  it('should load factions from IndexedDB on mount', async () => {
    mockOfflineStorage.getMyFactions.mockResolvedValue(mockMyFactions);

    const { result } = renderHook(() => useMyFactions());

    await waitFor(() => {
      expect(result.current[0]).toEqual(mockMyFactions);
    });

    expect(mockOfflineStorage.getMyFactions).toHaveBeenCalledTimes(1);
  });

  it('should initialize with empty array when IndexedDB returns null', async () => {
    mockOfflineStorage.getMyFactions.mockResolvedValue(null);

    const { result } = renderHook(() => useMyFactions());

    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });
  });

  it('should handle IndexedDB read errors gracefully', async () => {
    mockOfflineStorage.getMyFactions.mockRejectedValue(new Error('IndexedDB error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useMyFactions());

    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load my factions:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should update factions and save to IndexedDB', async () => {
    mockOfflineStorage.getMyFactions.mockResolvedValue([]);
    mockOfflineStorage.setMyFactions.mockResolvedValue();

    const { result } = renderHook(() => useMyFactions());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });

    // Update factions
    await act(async () => {
      await result.current[1](mockMyFactions);
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual(mockMyFactions);
    });

    expect(mockOfflineStorage.setMyFactions).toHaveBeenCalledWith(mockMyFactions);
  });

  it('should handle update errors and throw them', async () => {
    mockOfflineStorage.getMyFactions.mockResolvedValue([]);
    mockOfflineStorage.setMyFactions.mockRejectedValue(new Error('Save failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useMyFactions());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });

    // Attempt to update factions - should throw
    await act(async () => {
      await expect(result.current[1](mockMyFactions)).rejects.toThrow('Save failed');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to update my factions:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should allow setting empty array', async () => {
    mockOfflineStorage.getMyFactions.mockResolvedValue(mockMyFactions);
    mockOfflineStorage.setMyFactions.mockResolvedValue();

    const { result } = renderHook(() => useMyFactions());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current[0]).toEqual(mockMyFactions);
    });

    // Clear factions
    await act(async () => {
      await result.current[1]([]);
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });

    expect(mockOfflineStorage.setMyFactions).toHaveBeenCalledWith([]);
  });

  it('should maintain state consistency during multiple updates', async () => {
    mockOfflineStorage.getMyFactions.mockResolvedValue([]);
    mockOfflineStorage.setMyFactions.mockResolvedValue();

    const { result } = renderHook(() => useMyFactions());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });

    const faction1: depot.Option = { id: mockFactionIndex[0].id, name: mockFactionIndex[0].name };
    const faction2: depot.Option = { id: mockFactionIndex[2].id, name: mockFactionIndex[2].name };

    // Add first faction
    await act(async () => {
      await result.current[1]([faction1]);
    });
    await waitFor(() => {
      expect(result.current[0]).toEqual([faction1]);
    });

    // Add second faction
    await act(async () => {
      await result.current[1]([faction1, faction2]);
    });
    await waitFor(() => {
      expect(result.current[0]).toEqual([faction1, faction2]);
    });

    expect(mockOfflineStorage.setMyFactions).toHaveBeenCalledTimes(2);
  });
});
