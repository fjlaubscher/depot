import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AppProvider } from './context';
import { useAppContext } from './use-app-context';
import { depot } from "@depot/core";

// Mock offline storage using vi.hoisted for proper scoping
const mockOfflineStorage = vi.hoisted(() => ({
  getFactionIndex: vi.fn(),
  setFactionIndex: vi.fn(),
  getFaction: vi.fn(),
  setFaction: vi.fn(),
  getSettings: vi.fn(),
  setSettings: vi.fn(),
  getAllCachedFactions: vi.fn(),
  clearAllData: vi.fn(),
  destroy: vi.fn(),
  isDataStale: vi.fn()
}));

vi.mock('../../data/offline-storage', () => ({
  offlineStorage: mockOfflineStorage
}));

// Mock fetch
global.fetch = vi.fn();

// Test component to consume the context
const TestComponent = () => {
  const { state, loadFaction, updateSettings, clearOfflineData } = useAppContext();

  return (
    <div>
      <div data-testid="loading">{state.loading.toString()}</div>
      <div data-testid="error">{state.error || 'null'}</div>
      <div data-testid="faction-count">{state.factionIndex?.length || 0}</div>
      <div data-testid="offline-count">{state.offlineFactions.length}</div>
      <div data-testid="settings">{JSON.stringify(state.settings)}</div>
      <button onClick={() => loadFaction('test-faction')} data-testid="load-faction">
        Load Faction
      </button>
      <button
        onClick={() => updateSettings({ showForgeWorld: true, showLegends: false })}
        data-testid="update-settings"
      >
        Update Settings
      </button>
      <button onClick={() => clearOfflineData()} data-testid="clear-data">
        Clear Data
      </button>
    </div>
  );
};

const mockFactionIndex: depot.Index[] = [
  { id: 'space-marines', name: 'Space Marines', path: '/data/SM.json' },
  { id: 'chaos-marines', name: 'Chaos Space Marines', path: '/data/CSM.json' }
];

const mockFaction: depot.Faction = {
  id: 'test-faction',
  name: 'Test Faction',
  link: 'https://wahapedia.ru/wh40k10ed/factions/test-faction',
  datasheets: [],
  stratagems: [],
  enhancements: [],
  detachmentAbilities: []
};

const mockSettings: depot.Settings = {
  showForgeWorld: false,
  showLegends: true
};

describe('AppProvider with IndexedDB Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock behaviors
    mockOfflineStorage.getFactionIndex.mockResolvedValue(null);
    mockOfflineStorage.getFaction.mockResolvedValue(null);
    mockOfflineStorage.getSettings.mockResolvedValue(null);
    mockOfflineStorage.getAllCachedFactions.mockResolvedValue([]);
    mockOfflineStorage.setFactionIndex.mockResolvedValue(undefined);
    mockOfflineStorage.setFaction.mockResolvedValue(undefined);
    mockOfflineStorage.setSettings.mockResolvedValue(undefined);
    mockOfflineStorage.clearAllData.mockResolvedValue(undefined);

    // Mock fetch for network requests
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockFactionIndex
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should load faction index from IndexedDB first', async () => {
      mockOfflineStorage.getFactionIndex.mockResolvedValue(mockFactionIndex);

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('faction-count')).toHaveTextContent('2');
      });

      expect(mockOfflineStorage.getFactionIndex).toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fallback to network when IndexedDB is empty', async () => {
      mockOfflineStorage.getFactionIndex.mockResolvedValue(null);

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('faction-count')).toHaveTextContent('2');
      });

      expect(mockOfflineStorage.getFactionIndex).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith('/data/index.json');
      expect(mockOfflineStorage.setFactionIndex).toHaveBeenCalledWith(mockFactionIndex);
    });

    it('should load settings from IndexedDB on initialization', async () => {
      mockOfflineStorage.getSettings.mockResolvedValue(mockSettings);

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('settings')).toHaveTextContent(JSON.stringify(mockSettings));
      });

      expect(mockOfflineStorage.getSettings).toHaveBeenCalled();
    });

    it('should load offline factions list on initialization', async () => {
      const offlineFactions = [{ id: 'cached-faction', name: 'Cached Faction' }];
      mockOfflineStorage.getAllCachedFactions.mockResolvedValue(offlineFactions);

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('offline-count')).toHaveTextContent('1');
      });

      expect(mockOfflineStorage.getAllCachedFactions).toHaveBeenCalled();
    });
  });

  describe('loadFaction', () => {
    it('should load faction from IndexedDB first', async () => {
      mockOfflineStorage.getFaction.mockResolvedValue(mockFaction);

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      const loadButton = screen.getByTestId('load-faction');
      await act(async () => {
        loadButton.click();
      });

      await waitFor(() => {
        expect(mockOfflineStorage.getFaction).toHaveBeenCalledWith('test-faction');
      });

      expect(global.fetch).not.toHaveBeenCalledWith('/data/test-faction.json');
    });

    it('should fetch from network and cache when not in IndexedDB', async () => {
      mockOfflineStorage.getFaction.mockResolvedValue(null);
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockFaction
      });

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      const loadButton = screen.getByTestId('load-faction');
      await act(async () => {
        loadButton.click();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/data/test-faction.json');
      });

      expect(mockOfflineStorage.setFaction).toHaveBeenCalledWith('test-faction', mockFaction);
    });

    it('should handle network errors gracefully', async () => {
      mockOfflineStorage.getFaction.mockResolvedValue(null);
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      const loadButton = screen.getByTestId('load-faction');
      await act(async () => {
        loadButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      });
    });

    it('should skip network request if faction is already cached in memory', async () => {
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      const loadButton = screen.getByTestId('load-faction');

      // First load
      mockOfflineStorage.getFaction.mockResolvedValue(mockFaction);
      await act(async () => {
        loadButton.click();
      });

      await waitFor(() => {
        expect(mockOfflineStorage.getFaction).toHaveBeenCalledWith('test-faction');
      });

      vi.clearAllMocks();

      // Second load should not call IndexedDB or network
      await act(async () => {
        loadButton.click();
      });

      await waitFor(() => {
        expect(mockOfflineStorage.getFaction).not.toHaveBeenCalled();
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });
  });

  describe('updateSettings', () => {
    it('should save settings to IndexedDB and update state', async () => {
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      const updateButton = screen.getByTestId('update-settings');
      await act(async () => {
        updateButton.click();
      });

      await waitFor(() => {
        expect(mockOfflineStorage.setSettings).toHaveBeenCalledWith({
          showForgeWorld: true,
          showLegends: false
        });
      });

      expect(screen.getByTestId('settings')).toHaveTextContent(
        JSON.stringify({ showForgeWorld: true, showLegends: false })
      );
    });

    it('should update state even if IndexedDB save fails', async () => {
      mockOfflineStorage.setSettings.mockRejectedValue(new Error('IndexedDB error'));

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      const updateButton = screen.getByTestId('update-settings');
      await act(async () => {
        updateButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('settings')).toHaveTextContent(
          JSON.stringify({ showForgeWorld: true, showLegends: false })
        );
      });
    });
  });

  describe('clearOfflineData', () => {
    it('should clear IndexedDB and reload faction index from network', async () => {
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      const clearButton = screen.getByTestId('clear-data');

      // Mock window.location.reload
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { ...window.location, reload: mockReload },
        writable: true
      });

      await act(async () => {
        clearButton.click();
      });

      await waitFor(() => {
        expect(mockOfflineStorage.clearAllData).toHaveBeenCalled();
      });

      expect(global.fetch).toHaveBeenCalledWith('/data/index.json');
      expect(mockOfflineStorage.setFactionIndex).toHaveBeenCalledWith(mockFactionIndex);
      expect(mockReload).toHaveBeenCalled();
    });

    it('should handle errors in clearOfflineData', async () => {
      mockOfflineStorage.clearAllData.mockRejectedValue(new Error('Clear failed'));

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      const clearButton = screen.getByTestId('clear-data');
      await act(async () => {
        clearButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Clear failed');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle IndexedDB initialization errors gracefully', async () => {
      mockOfflineStorage.getFactionIndex.mockRejectedValue(new Error('IndexedDB error'));
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('IndexedDB error');
      });

      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    it('should handle settings loading errors without breaking initialization', async () => {
      mockOfflineStorage.getSettings.mockRejectedValue(new Error('Settings error'));
      mockOfflineStorage.getFactionIndex.mockResolvedValue(mockFactionIndex);

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('faction-count')).toHaveTextContent('2');
      });

      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });
  });
});
