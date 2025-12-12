import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useState } from 'react';
import type { depot } from '@depot/core';
import { FactionsProvider } from './context';
import { useFactionsContext } from './use-factions-context';

const mockOfflineStorage = vi.hoisted(() => ({
  getFactionIndex: vi.fn(),
  setFactionIndex: vi.fn(),
  getFactionManifest: vi.fn(),
  setFactionManifest: vi.fn(),
  getDatasheet: vi.fn(),
  setDatasheet: vi.fn(),
  getAllCachedFactions: vi.fn(),
  clearFactionData: vi.fn(),
  getDataVersion: vi.fn(),
  setDataVersion: vi.fn(),
  destroy: vi.fn()
}));

vi.mock('../../data/offline-storage', () => ({
  offlineStorage: mockOfflineStorage
}));

global.fetch = vi.fn();

const TestComponent = () => {
  const { state, getFactionManifest, getDatasheet, clearOfflineData } = useFactionsContext();
  const [manifestName, setManifestName] = useState<string | null>(null);
  const [datasheetName, setDatasheetName] = useState<string | null>(null);

  return (
    <div>
      <div data-testid="loading">{state.loading.toString()}</div>
      <div data-testid="error">{state.error || 'null'}</div>
      <div data-testid="faction-count">{state.factionIndex?.length || 0}</div>
      <div data-testid="offline-count">{state.offlineFactions.length}</div>
      <div data-testid="data-version">{state.dataVersion ?? 'null'}</div>
      <div data-testid="manifest-name">{manifestName ?? 'null'}</div>
      <div data-testid="datasheet-name">{datasheetName ?? 'null'}</div>
      <button
        onClick={async () => {
          const manifest = await getFactionManifest('test-faction');
          setManifestName(manifest?.name ?? null);
        }}
        data-testid="load-manifest"
      >
        Load Manifest
      </button>
      <button
        onClick={async () => {
          const datasheet = await getDatasheet('test-faction', 'test-datasheet');
          setDatasheetName(datasheet?.name ?? null);
        }}
        data-testid="load-datasheet"
      >
        Load Datasheet
      </button>
      <button onClick={() => clearOfflineData()} data-testid="clear-data">
        Clear Data
      </button>
    </div>
  );
};

const MOCK_DATA_VERSION = '2025-11-29T02:05:23';

const mockFactionIndex: depot.Index[] = [
  {
    id: 'SM',
    slug: 'space-marines',
    name: 'Space Marines',
    path: '/data/factions/space-marines/faction.json',
    dataVersion: MOCK_DATA_VERSION
  },
  {
    id: 'test-faction',
    slug: 'test-faction',
    name: 'Test Faction',
    path: '/data/factions/test-faction/faction.json',
    dataVersion: MOCK_DATA_VERSION
  }
];

const mockManifest: depot.FactionManifest = {
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
      role: 'Battleline',
      path: '/data/factions/test-faction/datasheets/test-datasheet.json',
      supplementSlug: undefined,
      supplementName: undefined,
      link: '',
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
  ],
  datasheetCount: 1,
  detachmentCount: 1
};

const mockDatasheet: depot.Datasheet = {
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
};

describe('FactionsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    mockOfflineStorage.getFactionIndex.mockResolvedValue(null);
    mockOfflineStorage.getFactionManifest.mockResolvedValue(null);
    mockOfflineStorage.getDatasheet.mockResolvedValue(null);
    mockOfflineStorage.getAllCachedFactions.mockResolvedValue([]);
    mockOfflineStorage.setFactionIndex.mockResolvedValue(undefined);
    mockOfflineStorage.setFactionManifest.mockResolvedValue(undefined);
    mockOfflineStorage.setDatasheet.mockResolvedValue(undefined);
    mockOfflineStorage.clearFactionData.mockResolvedValue(undefined);
    mockOfflineStorage.getDataVersion.mockResolvedValue(MOCK_DATA_VERSION);
    mockOfflineStorage.setDataVersion.mockResolvedValue(undefined);
    mockOfflineStorage.destroy.mockResolvedValue(undefined);

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockFactionIndex
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('loads faction index from IndexedDB first', async () => {
    mockOfflineStorage.getFactionIndex.mockResolvedValue(mockFactionIndex);

    render(
      <FactionsProvider>
        <TestComponent />
      </FactionsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('faction-count')).toHaveTextContent('2');
    });

    expect(mockOfflineStorage.getFactionIndex).toHaveBeenCalled();
    // Boot-time update check still refreshes the index in the background.
    expect(global.fetch).toHaveBeenCalledWith('/data/index.json');
  });

  it('falls back to network when IndexedDB is empty', async () => {
    mockOfflineStorage.getFactionIndex.mockResolvedValue(null);

    render(
      <FactionsProvider>
        <TestComponent />
      </FactionsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('faction-count')).toHaveTextContent('2');
    });

    expect(global.fetch).toHaveBeenCalledWith('/data/index.json');
    expect(mockOfflineStorage.setFactionIndex).toHaveBeenCalledWith(mockFactionIndex);
  });

  it('refreshes index and updates data version when version changes', async () => {
    mockOfflineStorage.getDataVersion.mockResolvedValue('legacy-version');
    mockOfflineStorage.getFactionIndex.mockResolvedValue(mockFactionIndex);

    render(
      <FactionsProvider>
        <TestComponent />
      </FactionsProvider>
    );

    await waitFor(() => {
      expect(mockOfflineStorage.setFactionIndex).toHaveBeenCalledWith(mockFactionIndex);
      expect(mockOfflineStorage.setDataVersion).toHaveBeenCalledWith(MOCK_DATA_VERSION);
    });

    expect(mockOfflineStorage.clearFactionData).not.toHaveBeenCalled();
  });

  it('loads offline factions list on initialization', async () => {
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
      <FactionsProvider>
        <TestComponent />
      </FactionsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('offline-count')).toHaveTextContent('1');
    });
  });

  it('fetches manifest from network and caches when not in IndexedDB', async () => {
    mockOfflineStorage.getFactionManifest.mockResolvedValue(null);
    mockOfflineStorage.getFactionIndex.mockResolvedValue(mockFactionIndex);
    (global.fetch as unknown as Mock).mockReset();
    // Boot-time update check refreshes the index first.
    (global.fetch as unknown as Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFactionIndex
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockManifest
      });

    render(
      <FactionsProvider>
        <TestComponent />
      </FactionsProvider>
    );

    const loadButton = screen.getByTestId('load-manifest');
    await act(async () => {
      loadButton.click();
    });

    await waitFor(() => {
      expect(mockOfflineStorage.setFactionManifest).toHaveBeenCalledWith(
        'test-faction',
        expect.anything()
      );
      expect(screen.getByTestId('manifest-name')).toHaveTextContent('Test Faction');
    });
  });

  it('fetches datasheet from network and caches when not in IndexedDB', async () => {
    (global.fetch as any).mockReset();
    mockOfflineStorage.getFactionManifest.mockResolvedValue(mockManifest);
    mockOfflineStorage.getDatasheet.mockResolvedValue(null);
    // Initial provider mount triggers two index fetches (init + boot update check).
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFactionIndex
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFactionIndex
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDatasheet
      });

    render(
      <FactionsProvider>
        <TestComponent />
      </FactionsProvider>
    );

    const loadButton = screen.getByTestId('load-datasheet');
    await act(async () => {
      loadButton.click();
    });

    await waitFor(() => {
      expect(mockOfflineStorage.getDatasheet).toHaveBeenCalledWith('test-datasheet');
      expect(mockOfflineStorage.setDatasheet).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-datasheet' })
      );
      expect(screen.getByTestId('datasheet-name')).toHaveTextContent('Test Datasheet');
    });
  });

  it('clears offline data and updates list', async () => {
    mockOfflineStorage.getAllCachedFactions.mockResolvedValue([
      {
        id: 'cached-faction',
        slug: 'cached-faction',
        name: 'Cached Faction',
        cachedDatasheets: 3
      }
    ]);

    render(
      <FactionsProvider>
        <TestComponent />
      </FactionsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('offline-count')).toHaveTextContent('1');
    });

    const clearButton = screen.getByTestId('clear-data');
    await act(async () => {
      clearButton.click();
    });

    await waitFor(() => {
      expect(mockOfflineStorage.clearFactionData).toHaveBeenCalled();
      expect(screen.getByTestId('offline-count')).toHaveTextContent('0');
    });
  });
});
