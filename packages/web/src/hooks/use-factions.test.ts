import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import useFactions from './use-factions';
import { offlineStorage } from '../data/offline-storage';
import { mockFactionIndex } from '@/test/mock-data';

// Mock offline storage
vi.mock('../data/offline-storage', () => ({
  offlineStorage: {
    getFactionIndex: vi.fn(),
    setFactionIndex: vi.fn()
  }
}));

const mockOfflineStorage = vi.mocked(offlineStorage);

// Mock fetch
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

describe('useFactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', async () => {
    mockOfflineStorage.getFactionIndex.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockFactionIndex)
    } as Response);

    const { result } = renderHook(() => useFactions());

    expect(result.current.factions).toBeUndefined();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    
    // Wait for the async operations to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should load factions from IndexedDB when available', async () => {
    mockOfflineStorage.getFactionIndex.mockResolvedValue(mockFactionIndex);

    const { result } = renderHook(() => useFactions());

    await waitFor(() => {
      expect(result.current.factions).toEqual(mockFactionIndex);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    expect(mockOfflineStorage.getFactionIndex).toHaveBeenCalledTimes(1);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should fallback to network when IndexedDB returns null', async () => {
    mockOfflineStorage.getFactionIndex.mockResolvedValue(null);
    mockOfflineStorage.setFactionIndex.mockResolvedValue();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockFactionIndex)
    } as Response);

    const { result } = renderHook(() => useFactions());

    await waitFor(() => {
      expect(result.current.factions).toEqual(mockFactionIndex);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    expect(mockOfflineStorage.getFactionIndex).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/data/index.json');
    expect(mockOfflineStorage.setFactionIndex).toHaveBeenCalledWith(mockFactionIndex);
  });

  it('should handle network fetch errors', async () => {
    mockOfflineStorage.getFactionIndex.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: false
    } as Response);

    const { result } = renderHook(() => useFactions());

    await waitFor(() => {
      expect(result.current.factions).toBeUndefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to load faction index');
    });

    expect(mockOfflineStorage.setFactionIndex).not.toHaveBeenCalled();
  });

  it('should handle IndexedDB errors gracefully and fallback to network', async () => {
    mockOfflineStorage.getFactionIndex.mockRejectedValue(new Error('IndexedDB error'));
    mockOfflineStorage.setFactionIndex.mockResolvedValue();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockFactionIndex)
    } as Response);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useFactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('IndexedDB error');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load factions:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should handle cache save errors gracefully', async () => {
    mockOfflineStorage.getFactionIndex.mockResolvedValue(null);
    mockOfflineStorage.setFactionIndex.mockRejectedValue(new Error('Cache error'));
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockFactionIndex)
    } as Response);
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useFactions());

    await waitFor(() => {
      expect(result.current.factions).toEqual(mockFactionIndex);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to cache faction index:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should allow manual refetch', async () => {
    mockOfflineStorage.getFactionIndex.mockResolvedValue(mockFactionIndex);

    const { result } = renderHook(() => useFactions());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.factions).toEqual(mockFactionIndex);
    });

    // Clear mocks for refetch test
    vi.clearAllMocks();
    mockOfflineStorage.getFactionIndex.mockResolvedValue(mockFactionIndex);

    // Trigger refetch
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockOfflineStorage.getFactionIndex).toHaveBeenCalledTimes(1);
  });

  it('should handle refetch errors', async () => {
    mockOfflineStorage.getFactionIndex.mockResolvedValue(mockFactionIndex);

    const { result } = renderHook(() => useFactions());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.factions).toEqual(mockFactionIndex);
    });

    // Setup error for refetch
    mockOfflineStorage.getFactionIndex.mockRejectedValue(new Error('Refetch error'));
    mockFetch.mockResolvedValue({
      ok: false
    } as Response);

    // Trigger refetch
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Refetch error');
    });
  });

  it('should set empty array when network returns no data', async () => {
    mockOfflineStorage.getFactionIndex.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null)
    } as Response);

    const { result } = renderHook(() => useFactions());

    await waitFor(() => {
      expect(result.current.factions).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });
});
