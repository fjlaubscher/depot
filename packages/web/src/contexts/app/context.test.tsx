import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useState } from 'react';
import { AppProvider } from './context';
import { useAppContext } from './use-app-context';
import type { depot } from '@depot/core';
import { DEFAULT_SETTINGS } from '@/constants/settings';
import { DATA_VERSION } from '@/constants/data-version';

// Mock offline storage using vi.hoisted for proper scoping
const mockOfflineStorage = vi.hoisted(() => ({
  getFactionIndex: vi.fn(),
  setFactionIndex: vi.fn(),
  getFactionManifest: vi.fn(),
  setFactionManifest: vi.fn(),
  getDatasheet: vi.fn(),
  setDatasheet: vi.fn(),
  getSettings: vi.fn(),
  setSettings: vi.fn(),
  getAllCachedFactions: vi.fn(),
  clearFactionData: vi.fn(),
  clearAllData: vi.fn(),
  getDataVersion: vi.fn(),
  setDataVersion: vi.fn(),
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
  const { state, getFactionManifest, getDatasheet, updateSettings, clearOfflineData } =
    useAppContext();
  const [factionUpdateStatus, setFactionUpdateStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const [manifestName, setManifestName] = useState<string | null>(null);
  const [datasheetName, setDatasheetName] = useState<string | null>(null);

  const handleLoadManifest = async () => {
    const manifest = await getFactionManifest('test-faction');
    setManifestName(manifest?.name ?? null);
  };

  const handleLoadDatasheet = async () => {
    try {
      const datasheet = await getDatasheet('test-faction', 'test-datasheet');
      setDatasheetName(datasheet?.name ?? null);
    } catch {
      setDatasheetName(null);
    }
  };

  return (
    <div>
      <div data-testid="loading">{state.loading.toString()}</div>
      <div data-testid="error">{state.error || 'null'}</div>
      <div data-testid="faction-count">{state.factionIndex?.length || 0}</div>
      <div data-testid="offline-count">{state.offlineFactions.length}</div>
      <div data-testid="settings">{JSON.stringify(state.settings)}</div>
      <div data-testid="manifest-name">{manifestName ?? 'null'}</div>
      <div data-testid="datasheet-name">{datasheetName ?? 'null'}</div>
      <button onClick={handleLoadManifest} data-testid="load-manifest">
        Load Manifest
      </button>
      <button onClick={handleLoadDatasheet} data-testid="load-datasheet">
        Load Datasheet
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
  {
    id: 'SM',
    slug: 'space-marines',
    name: 'Space Marines',
    path: '/data/factions/space-marines/faction.json',
    dataVersion: DATA_VERSION
  },
  {
    id: 'CSM',
    slug: 'chaos-space-marines',
    name: 'Chaos Space Marines',
    path: '/data/factions/chaos-space-marines/faction.json',
    dataVersion: DATA_VERSION
  },
  {
    id: 'test-faction',
    slug: 'test-faction',
    name: 'Test Faction',
    path: '/data/factions/test-faction/faction.json',
    dataVersion: DATA_VERSION
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
      sourceName: 'Test Source',
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
  detachments: [
    {
      slug: 'test-detachment',
      name: 'Test Detachment',
      abilities: [],
      enhancements: [],
      stratagems: []
    }
  ]
};

const mockManifest: depot.FactionManifest = {
  id: mockFaction.id,
  slug: mockFaction.slug,
  name: mockFaction.name,
  link: mockFaction.link,
  datasheets: [
    {
      id: 'test-datasheet',
      slug: 'test-datasheet',
      name: 'Test Datasheet',
      factionId: mockFaction.id,
      factionSlug: mockFaction.slug,
      role: 'Battleline',
      path: '/data/factions/test-faction/datasheets/test-datasheet.json',
      supplementSlug: undefined,
      supplementName: undefined,
      link: '',
      isForgeWorld: false,
      isLegends: false
    }
  ],
  detachments: mockFaction.detachments,
  datasheetCount: 1,
  detachmentCount: 1
};

const mockSettings: depot.Settings = {
  showForgeWorld: false,
  showLegends: true,
  showUnaligned: false,
  showFluff: true,
  includeWargearOnExport: true,
  useNativeShare: true,
  usePileOfShameLabel: true
};

describe('AppProvider with IndexedDB Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Suppress console.error and console.warn during tests to avoid stderr noise
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Setup default mock behaviors
    mockOfflineStorage.getFactionIndex.mockResolvedValue(null);
    mockOfflineStorage.getFactionManifest.mockResolvedValue(null);
    mockOfflineStorage.getDatasheet.mockResolvedValue(null);
    mockOfflineStorage.getSettings.mockResolvedValue(null);
    mockOfflineStorage.getAllCachedFactions.mockResolvedValue([]);
    mockOfflineStorage.setFactionIndex.mockResolvedValue(undefined);
    mockOfflineStorage.setFactionManifest.mockResolvedValue(undefined);
    mockOfflineStorage.setDatasheet.mockResolvedValue(undefined);
    mockOfflineStorage.setSettings.mockResolvedValue(undefined);
    mockOfflineStorage.clearFactionData.mockResolvedValue(undefined);
    mockOfflineStorage.clearAllData.mockResolvedValue(undefined);
    mockOfflineStorage.getDataVersion.mockResolvedValue(DATA_VERSION);
    mockOfflineStorage.setDataVersion.mockResolvedValue(undefined);
    mockOfflineStorage.destroy.mockResolvedValue(undefined);

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
        expect(screen.getByTestId('faction-count')).toHaveTextContent('3');
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
        expect(screen.getByTestId('faction-count')).toHaveTextContent('3');
      });

      expect(mockOfflineStorage.getFactionIndex).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith('/data/index.json');
      expect(mockOfflineStorage.setFactionIndex).toHaveBeenCalledWith(mockFactionIndex);
    });

    it('should clear cached faction data when stored data version is missing but index has one', async () => {
      mockOfflineStorage.getDataVersion.mockResolvedValue(null);
      mockOfflineStorage.getFactionIndex.mockResolvedValue(mockFactionIndex);
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFactionIndex
      });

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await waitFor(() => {
        expect(mockOfflineStorage.clearFactionData).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith('/data/index.json');
        expect(mockOfflineStorage.setDataVersion).toHaveBeenCalledWith(DATA_VERSION);
      });
    });

    it('should load settings from IndexedDB on initialization', async () => {
      mockOfflineStorage.getSettings.mockResolvedValue(mockSettings);

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('settings')).toHaveTextContent(
          JSON.stringify({ ...DEFAULT_SETTINGS, ...mockSettings })
        );
      });

      expect(mockOfflineStorage.getSettings).toHaveBeenCalled();
    });

    it('should load offline factions list on initialization', async () => {
      const offlineFactions = [
        {
          id: 'cached-faction',
          slug: 'cached-faction',
          name: 'Cached Faction',
          cachedDatasheets: 3
        }
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

    it('should clear cached faction data when data version changes', async () => {
      mockOfflineStorage.getDataVersion.mockResolvedValue('legacy-version');
      mockOfflineStorage.getFactionIndex.mockResolvedValue(mockFactionIndex);

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await waitFor(() => {
        expect(mockOfflineStorage.clearFactionData).toHaveBeenCalledTimes(1);
        expect(mockOfflineStorage.destroy).not.toHaveBeenCalled();
        expect(mockOfflineStorage.setDataVersion).toHaveBeenCalledWith(DATA_VERSION);
      });
    });

    it('should fall back to full reset when clearing cached faction data fails', async () => {
      const clearError = new Error('clear failed');
      mockOfflineStorage.getDataVersion.mockResolvedValue('legacy-version');
      mockOfflineStorage.clearFactionData.mockRejectedValueOnce(clearError);
      mockOfflineStorage.getFactionIndex.mockResolvedValue(mockFactionIndex);

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await waitFor(() => {
        expect(mockOfflineStorage.clearFactionData).toHaveBeenCalledTimes(1);
        expect(mockOfflineStorage.destroy).toHaveBeenCalledTimes(1);
        expect(mockOfflineStorage.setDataVersion).toHaveBeenCalledWith(DATA_VERSION);
      });
    });

    it('should clear cached faction data when the stored version cannot be read', async () => {
      const versionError = new Error('version read failed');
      mockOfflineStorage.getDataVersion.mockRejectedValueOnce(versionError);
      mockOfflineStorage.getFactionIndex.mockResolvedValue(mockFactionIndex);

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await waitFor(() => {
        expect(mockOfflineStorage.clearFactionData).toHaveBeenCalledTimes(1);
        expect(mockOfflineStorage.destroy).not.toHaveBeenCalled();
        expect(mockOfflineStorage.setDataVersion).toHaveBeenCalledWith(DATA_VERSION);
      });
    });
  });

  describe('load data', () => {
    it('should load manifest from IndexedDB first', async () => {
      mockOfflineStorage.getFactionManifest.mockResolvedValue(mockManifest);
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFactionIndex
      });

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      const loadButton = screen.getByTestId('load-manifest');
      await act(async () => {
        loadButton.click();
      });

      await waitFor(() => {
        expect(mockOfflineStorage.getFactionManifest).toHaveBeenCalledWith('test-faction');
        expect(screen.getByTestId('manifest-name')).toHaveTextContent('Test Faction');
      });
    });

    it('should fetch manifest from network and cache when not in IndexedDB', async () => {
      mockOfflineStorage.getFactionManifest.mockResolvedValue(null);
      const fetchMock = global.fetch as unknown as Mock;
      fetchMock.mockClear();
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockManifest
      });

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      const loadButton = screen.getByTestId('load-manifest');
      await act(async () => {
        loadButton.click();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/data/factions/test-faction/faction.json');
      });

      expect(mockOfflineStorage.setFactionManifest).toHaveBeenCalledWith(
        'test-faction',
        expect.anything()
      );
    });

    it('should fetch datasheet from network and cache when not in IndexedDB', async () => {
      (global.fetch as any).mockReset();
      mockOfflineStorage.getFactionManifest.mockResolvedValue(mockManifest);
      mockOfflineStorage.getDatasheet.mockResolvedValue(null);
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFactionIndex
      });
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFaction.datasheets[0]
      });

      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      const loadButton = screen.getByTestId('load-datasheet');
      await act(async () => {
        loadButton.click();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/data/factions/test-faction/datasheets/test-datasheet.json'
        );
      });
      await waitFor(() => {
        expect(mockOfflineStorage.getAllCachedFactions).toHaveBeenCalledTimes(2);
      });
      expect(mockOfflineStorage.setDatasheet).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-datasheet' })
      );
      expect(screen.getByTestId('datasheet-name')).toHaveTextContent('Test Datasheet');
    });
  });

  describe('updateSettings', () => {
    it('should save settings to IndexedDB and update state', async () => {
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('settings')).toHaveTextContent(JSON.stringify(DEFAULT_SETTINGS));
      });

      const updateButton = screen.getByTestId('update-settings');
      await act(async () => {
        updateButton.click();
      });

      const expectedSettings = {
        ...DEFAULT_SETTINGS,
        showForgeWorld: true,
        showLegends: false
      };

      await waitFor(() => {
        expect(mockOfflineStorage.setSettings).toHaveBeenCalledWith(expectedSettings);
      });

      expect(screen.getByTestId('settings')).toHaveTextContent(JSON.stringify(expectedSettings));
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

  // My factions removed; no tests needed
});
