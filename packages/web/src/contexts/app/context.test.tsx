import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AppProvider } from './context';
import { useAppContext } from './use-app-context';
import type { depot } from '@depot/core';

// Mock offline storage using vi.hoisted for proper scoping
const mockOfflineStorage = vi.hoisted(() => ({
  getFactionIndex: vi.fn(),
  setFactionIndex: vi.fn(),
  getFaction: vi.fn(),
  setFaction: vi.fn(),
  getSettings: vi.fn(),
  setSettings: vi.fn(),
  getAllCachedFactions: vi.fn(),
  clearFactionData: vi.fn(),
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
  const { state, getFaction, updateSettings, clearOfflineData } = useAppContext();

  return (
    <div>
      <div data-testid="loading">{state.loading.toString()}</div>
      <div data-testid="error">{state.error || 'null'}</div>
      <div data-testid="faction-count">{state.factionIndex?.length || 0}</div>
      <div data-testid="offline-count">{state.offlineFactions.length}</div>
      <div data-testid="settings">{JSON.stringify(state.settings)}</div>
      <button onClick={() => getFaction('test-faction')} data-testid="load-faction">
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
  { id: 'SM', slug: 'space-marines', name: 'Space Marines', path: '/data/space-marines.json' },
  {
    id: 'CSM',
    slug: 'chaos-space-marines',
    name: 'Chaos Space Marines',
    path: '/data/chaos-space-marines.json'
  }
];

const mockFaction: depot.Faction = {
  id: 'test-faction',
  slug: 'test-faction',
  name: 'Test Faction',
  link: 'https://wahapedia.ru/wh40k10ed/factions/test-faction',
  datasheets: [
    {
      id: 'test-datasheet',
      slug: 'test-datasheet',
      name: 'Test Datasheet',
      factionId: 'test-faction',
      factionSlug: 'test-faction',
      sourceId: 'core',
      legend: '',
      role: 'Battleline',
      loadout: '',
      transport: '',
      virtual: false,
      leaderHead: '',
      leaderFooter: '',
      damagedW: '',
      damagedDescription: '',
      link: '',
      abilities: [],
      keywords: [],
      models: [],
      options: [],
      wargear: [],
      unitComposition: [],
      modelCosts: [],
      stratagems: [],
      enhancements: [],
      detachmentAbilities: [],
      leaders: [],
      isForgeWorld: false,
      isLegends: false
    }
  ],
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

    // Suppress console.error and console.warn during tests to avoid stderr noise
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Setup default mock behaviors
    mockOfflineStorage.getFactionIndex.mockResolvedValue(null);
    mockOfflineStorage.getFaction.mockResolvedValue(null);
    mockOfflineStorage.getSettings.mockResolvedValue(null);
    mockOfflineStorage.getAllCachedFactions.mockResolvedValue([]);
    mockOfflineStorage.setFactionIndex.mockResolvedValue(undefined);
    mockOfflineStorage.setFaction.mockResolvedValue(undefined);
    mockOfflineStorage.setSettings.mockResolvedValue(undefined);
    mockOfflineStorage.clearFactionData.mockResolvedValue(undefined);
    mockOfflineStorage.clearAllData.mockResolvedValue(undefined);

    // Mock fetch for network requests
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockFactionIndex
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
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
      const offlineFactions = [
        { id: 'cached-faction', slug: 'cached-faction', name: 'Cached Faction' }
      ];
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
  });

  describe('clearOfflineData', () => {
    it('should clear cached factions and update state', async () => {
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await waitFor(() => {
        expect(mockOfflineStorage.setFactionIndex.mock.calls.length).toBeGreaterThanOrEqual(1);
      });

      const clearButton = screen.getByTestId('clear-data');
      const initialSetIndexCalls = mockOfflineStorage.setFactionIndex.mock.calls.length;

      await act(async () => {
        clearButton.click();
      });

      await waitFor(() => {
        expect(mockOfflineStorage.clearFactionData).toHaveBeenCalled();
      });

      // Check that the offline factions list is reset
      expect(screen.getByTestId('offline-count')).toHaveTextContent('0');

      // Ensure clearing factions does not trigger index rewrite
      expect(mockOfflineStorage.setFactionIndex.mock.calls.length).toBe(initialSetIndexCalls);
    });
  });
});
