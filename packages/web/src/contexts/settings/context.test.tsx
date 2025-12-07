import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useState } from 'react';
import type { depot } from '@depot/core';
import { SettingsProvider } from './context';
import { useSettingsContext } from './use-settings-context';
import { DEFAULT_SETTINGS } from '@/constants/settings';

const mockOfflineStorage = vi.hoisted(() => ({
  getSettings: vi.fn(),
  setSettings: vi.fn()
}));

vi.mock('../../data/offline-storage', () => ({
  offlineStorage: mockOfflineStorage
}));

const TestComponent = () => {
  const { state, updateSettings } = useSettingsContext();
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle');

  const handleUpdate = async () => {
    setStatus('saving');
    await updateSettings({ ...state.settings, showForgeWorld: true });
    setStatus('done');
  };

  return (
    <div>
      <div data-testid="settings">{JSON.stringify(state.settings)}</div>
      <div data-testid="status">{state.status}</div>
      <div data-testid="local-status">{status}</div>
      <button onClick={() => void handleUpdate()} data-testid="update-settings">
        Update
      </button>
    </div>
  );
};

describe('SettingsProvider', () => {
  const mockSettings: depot.Settings = {
    showForgeWorld: false,
    showLegends: true,
    showUnaligned: false,
    showFluff: true,
    includeWargearOnExport: true,
    useNativeShare: true,
    usePileOfShameLabel: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOfflineStorage.getSettings.mockResolvedValue(null);
    mockOfflineStorage.setSettings.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('loads settings from IndexedDB and merges with defaults', async () => {
    mockOfflineStorage.getSettings.mockResolvedValue(mockSettings);

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('settings')).toHaveTextContent(
        JSON.stringify({ ...DEFAULT_SETTINGS, ...mockSettings })
      );
    });

    expect(mockOfflineStorage.getSettings).toHaveBeenCalled();
  });

  it('falls back to defaults when no stored settings exist', async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('settings')).toHaveTextContent(JSON.stringify(DEFAULT_SETTINGS));
    });
  });

  it('updates settings and persists to IndexedDB', async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const updateButton = screen.getByTestId('update-settings');

    await act(async () => {
      updateButton.click();
    });

    const expectedSettings = { ...DEFAULT_SETTINGS, showForgeWorld: true };

    await waitFor(() => {
      expect(mockOfflineStorage.setSettings).toHaveBeenCalledWith(expectedSettings);
      expect(screen.getByTestId('settings')).toHaveTextContent(JSON.stringify(expectedSettings));
    });
  });
});
