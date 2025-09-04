import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { depot } from '@depot/core';
import useSettings from './use-settings';
import { offlineStorage } from '../data/offline-storage';

// Mock offline storage
vi.mock('../data/offline-storage', () => ({
  offlineStorage: {
    getSettings: vi.fn(),
    setSettings: vi.fn()
  }
}));

const mockOfflineStorage = vi.mocked(offlineStorage);

describe('useSettings', () => {
  const mockSettings: depot.Settings = {
    showForgeWorld: true,
    showLegends: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with undefined settings', () => {
    mockOfflineStorage.getSettings.mockResolvedValue(null);

    const { result } = renderHook(() => useSettings());

    expect(result.current[0]).toBeUndefined();
  });

  it('should load settings from IndexedDB on mount', async () => {
    mockOfflineStorage.getSettings.mockResolvedValue(mockSettings);

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current[0]).toEqual(mockSettings);
    });

    expect(mockOfflineStorage.getSettings).toHaveBeenCalledTimes(1);
  });

  it('should initialize with undefined when IndexedDB returns null', async () => {
    mockOfflineStorage.getSettings.mockResolvedValue(null);

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current[0]).toBeUndefined();
    });
  });

  it('should handle IndexedDB read errors gracefully', async () => {
    mockOfflineStorage.getSettings.mockRejectedValue(new Error('IndexedDB error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current[0]).toBeUndefined();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load settings:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should update settings and save to IndexedDB', async () => {
    mockOfflineStorage.getSettings.mockResolvedValue(null);
    mockOfflineStorage.setSettings.mockResolvedValue();

    const { result } = renderHook(() => useSettings());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current[0]).toBeUndefined();
    });

    // Update settings
    await act(async () => {
      await result.current[1](mockSettings);
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual(mockSettings);
    });

    expect(mockOfflineStorage.setSettings).toHaveBeenCalledWith(mockSettings);
  });

  it('should handle update errors and throw them', async () => {
    mockOfflineStorage.getSettings.mockResolvedValue(null);
    mockOfflineStorage.setSettings.mockRejectedValue(new Error('Save failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useSettings());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current[0]).toBeUndefined();
    });

    // Attempt to update settings - should throw
    await act(async () => {
      await expect(result.current[1](mockSettings)).rejects.toThrow('Save failed');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to update settings:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should allow updating partial settings', async () => {
    mockOfflineStorage.getSettings.mockResolvedValue(mockSettings);
    mockOfflineStorage.setSettings.mockResolvedValue();

    const { result } = renderHook(() => useSettings());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current[0]).toEqual(mockSettings);
    });

    const updatedSettings: depot.Settings = {
      ...mockSettings,
      showForgeWorld: false
    };

    // Update settings
    await act(async () => {
      await result.current[1](updatedSettings);
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual(updatedSettings);
    });

    expect(mockOfflineStorage.setSettings).toHaveBeenCalledWith(updatedSettings);
  });

  it('should maintain state consistency during multiple updates', async () => {
    mockOfflineStorage.getSettings.mockResolvedValue(null);
    mockOfflineStorage.setSettings.mockResolvedValue();

    const { result } = renderHook(() => useSettings());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current[0]).toBeUndefined();
    });

    const settings1: depot.Settings = {
      showForgeWorld: true,
      showLegends: true
    };

    const settings2: depot.Settings = {
      showForgeWorld: false,
      showLegends: false
    };

    // Update settings first time
    await act(async () => {
      await result.current[1](settings1);
    });
    await waitFor(() => {
      expect(result.current[0]).toEqual(settings1);
    });

    // Update settings second time
    await act(async () => {
      await result.current[1](settings2);
    });
    await waitFor(() => {
      expect(result.current[0]).toEqual(settings2);
    });

    expect(mockOfflineStorage.setSettings).toHaveBeenCalledTimes(2);
    expect(mockOfflineStorage.setSettings).toHaveBeenNthCalledWith(1, settings1);
    expect(mockOfflineStorage.setSettings).toHaveBeenNthCalledWith(2, settings2);
  });
});
