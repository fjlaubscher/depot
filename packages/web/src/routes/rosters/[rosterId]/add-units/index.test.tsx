import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent, within } from '@testing-library/react';
import type { MutableRefObject } from 'react';
import type { depot } from '@depot/core';
import { TestWrapper } from '@/test/test-utils';
import { createMockRosterUnit, createMockDatasheet } from '@/test/mock-data';
import { filterDatasheetsBySettings } from '@/utils/datasheet-filters';
import AddRosterUnitsPage from './index';

// Mock AppLayout
vi.mock('@/components/layout', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="app-layout" data-title={title}>
      <main id="app-content">{children}</main>
    </div>
  )
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ rosterId: 'test-roster-id' }),
    useNavigate: () => mockNavigate
  };
});

// Mock RosterProvider and useRoster
const mockRosterContext = vi.hoisted(() => ({
  state: {
    id: 'test-roster-id',
    name: 'Test Roster',
    factionId: 'SM',
    factionSlug: 'space-marines',
    faction: { id: 'SM', slug: 'space-marines', name: 'Space Marines' },
    detachment: { name: 'Gladius Task Force' },
    warlordUnitId: null,
    units: [],
    enhancements: [],
    points: { current: 0, max: 2000 }
  },
  addUnit: vi.fn()
}));

vi.mock('@/contexts/roster/context', () => ({
  RosterProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="roster-provider">{children}</div>
  )
}));

vi.mock('@/contexts/roster/use-roster-context', () => ({
  useRoster: () => mockRosterContext
}));

// Mock useAppContext
const mockAppState = vi.hoisted(() => ({
  state: {
    settings: {
      showLegends: false,
      showForgeWorld: false
    }
  },
  getFaction: vi.fn().mockResolvedValue({
    id: 'SM',
    slug: 'space-marines',
    name: 'Space Marines',
    datasheets: []
  }),
  updateSettings: vi.fn(),
  updateMyFactions: vi.fn(),
  clearOfflineData: vi.fn(),
  dispatch: vi.fn()
}));

vi.mock('@/contexts/app/use-app-context', () => ({
  useAppContext: () => mockAppState
}));

// Mock toast context
const mockShowToast = vi.fn();
vi.mock('@/contexts/toast/use-toast-context', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}));

import type { SelectedUnit } from '@/hooks/use-roster-unit-selection';

const mockUseFaction = vi.hoisted(() =>
  vi.fn(() => ({
    data: null,
    loading: false,
    error: null
  }))
);

vi.mock('@/hooks/use-faction', () => ({
  default: mockUseFaction
}));

// Mock useRosterUnitSelection hook
const mockUnitSelection = vi.hoisted(() => ({
  selectedUnits: [] as SelectedUnit[],
  totalSelectedPoints: 0,
  addToSelection: vi.fn(),
  removeLatestUnit: vi.fn(),
  getUnitCount: vi.fn(() => 0),
  clearSelection: vi.fn(),
  hasSelection: false
}));

vi.mock('@/hooks/use-roster-unit-selection', () => ({
  useRosterUnitSelection: () => mockUnitSelection
}));

// Mock useScrollCollapse hook
const mockScrollState = vi.hoisted(() => ({
  sentinelRef: { current: null } as MutableRefObject<HTMLDivElement | null>,
  scrollToTop: vi.fn()
}));

let currentIsAtTop = true;

vi.mock('@/hooks/use-scroll-collapse', () => ({
  useScrollCollapse: () => ({
    sentinelRef: mockScrollState.sentinelRef,
    isAtTop: currentIsAtTop,
    scrollToTop: mockScrollState.scrollToTop
  })
}));

// Mock DatasheetBrowser component
vi.mock('@/components/shared/datasheet', async () => {
  const actual = await vi.importActual<typeof import('@/components/shared/datasheet')>(
    '@/components/shared/datasheet'
  );

  return {
    ...actual,
    DatasheetBrowser: ({
      datasheets,
      renderDatasheet,
      filters
    }: {
      datasheets: depot.Datasheet[];
      renderDatasheet?: (datasheet: depot.Datasheet) => React.ReactNode;
      filters?: { showLegends?: boolean; showForgeWorld?: boolean };
    }) => {
      const filteredDatasheets = filterDatasheetsBySettings(datasheets, filters);

      return (
        <div data-testid="datasheet-browser">
          {filteredDatasheets.map((datasheet) => (
            <div key={datasheet.id} data-testid="datasheet-item">
              {renderDatasheet ? renderDatasheet(datasheet) : datasheet.name}
            </div>
          ))}
        </div>
      );
    }
  };
});

describe('AddRosterUnitsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentIsAtTop = true;
    mockScrollState.scrollToTop = vi.fn();
    mockScrollState.sentinelRef.current = null;
    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query.includes('min-width: 768px'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn()
        }))
      });
    }

    Object.defineProperty(window.HTMLElement.prototype, 'scrollTo', {
      writable: true,
      value: vi.fn()
    });
    mockUseFaction.mockReturnValue({
      data: null,
      loading: false,
      error: null
    });
    mockRosterContext.state = {
      id: 'test-roster-id',
      name: 'Test Roster',
      factionId: 'SM',
      factionSlug: 'space-marines',
      faction: { id: 'SM', slug: 'space-marines', name: 'Space Marines' },
      detachment: { name: 'Gladius Task Force' },
      warlordUnitId: null,
      units: [],
      enhancements: [],
      points: { current: 0, max: 2000 }
    };
    mockUnitSelection.selectedUnits = [];
    mockUnitSelection.hasSelection = false;
    mockUnitSelection.totalSelectedPoints = 0;
    mockUnitSelection.getUnitCount.mockImplementation(() => 0);
    mockAppState.state = {
      settings: {
        showLegends: false,
        showForgeWorld: false
      }
    };
  });

  it('renders loading state when roster has no id', async () => {
    mockRosterContext.state = { ...mockRosterContext.state, id: '' };

    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders add roster units view with provider wrapper', async () => {
    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    expect(screen.getByTestId('roster-provider')).toBeInTheDocument();
  });

  it('displays roster header information', async () => {
    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    expect(screen.getByText('Test Roster')).toBeInTheDocument();
    expect(screen.getByText('Space Marines • Gladius Task Force')).toBeInTheDocument();
    expect(screen.getByText('Add Units')).toBeInTheDocument();
  });

  it('renders page header with back navigation', async () => {
    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    const pageHeader = screen.getByTestId('page-header');
    expect(within(pageHeader).getByText('Test Roster')).toBeInTheDocument();
    expect(within(pageHeader).getByText('Space Marines • Gladius Task Force')).toBeInTheDocument();
  });

  it('renders datasheet browser when faction data is loaded', async () => {
    // Set faction data as loaded
    mockRosterContext.state = {
      ...mockRosterContext.state,
      id: 'test-roster-id',
      faction: { id: 'SM', slug: 'space-marines', name: 'Space Marines' }
    };

    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    // Wait for faction data to load and check for datasheet browser
    await waitFor(() => {
      expect(screen.queryByTestId('datasheet-browser')).toBeInTheDocument();
    });
  });

  it('adds unit through datasheet card add button', async () => {
    const datasheet = createMockDatasheet();
    mockUseFaction.mockReturnValue({
      data: {
        id: 'SM',
        slug: 'space-marines',
        name: 'Space Marines',
        datasheets: [datasheet]
      } as any,
      loading: false,
      error: null
    });

    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    const card = screen.getByTestId('datasheet-item');
    const addButton = within(card).getByRole('button', { name: 'Add' });

    fireEvent.click(addButton);

    expect(mockUnitSelection.addToSelection).toHaveBeenCalledWith(
      datasheet,
      datasheet.modelCosts[0]
    );
  });

  it('opens selection summary drawer with quantity controls', async () => {
    const datasheet = createMockDatasheet();
    const rosterUnit = createMockRosterUnit({
      datasheet,
      modelCost: datasheet.modelCosts[0]
    });

    mockUnitSelection.selectedUnits = [rosterUnit, { ...rosterUnit, id: 'second-unit' }];
    mockUnitSelection.hasSelection = true;
    mockUnitSelection.totalSelectedPoints = 160;
    mockUnitSelection.getUnitCount.mockImplementation(() => 2);

    mockUseFaction.mockReturnValue({
      data: {
        id: 'SM',
        slug: 'space-marines',
        name: 'Space Marines',
        datasheets: [datasheet]
      } as any,
      loading: false,
      error: null
    });

    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /review selection/i }));
    });

    const summary = await screen.findByTestId('unit-selection-summary');
    const rowTestId = `selection-item-${datasheet.id}-${datasheet.modelCosts[0].line}`;

    expect(within(summary).getByText('Selection Summary')).toBeInTheDocument();
    expect(within(summary).getByText('2 units • 160 pts')).toBeInTheDocument();

    const summaryRow = await within(summary).findByTestId(rowTestId);
    expect(summaryRow).toHaveTextContent(datasheet.name);
    expect(summaryRow).toHaveTextContent(`${datasheet.modelCosts[0].cost} pts`);

    fireEvent.click(within(summary).getByLabelText(`Increase ${datasheet.name}`));
    expect(mockUnitSelection.addToSelection).toHaveBeenCalledWith(
      datasheet,
      datasheet.modelCosts[0]
    );

    fireEvent.click(within(summary).getByLabelText(`Decrease ${datasheet.name}`));
    expect(mockUnitSelection.removeLatestUnit).toHaveBeenCalledWith(
      datasheet,
      datasheet.modelCosts[0]
    );
  });

  it('keeps summary hidden until review button is clicked', async () => {
    const datasheet = createMockDatasheet();
    const rosterUnit = createMockRosterUnit({
      datasheet,
      modelCost: datasheet.modelCosts[0]
    });

    mockUnitSelection.selectedUnits = [rosterUnit];
    mockUnitSelection.hasSelection = true;
    mockUnitSelection.totalSelectedPoints = 80;
    mockUnitSelection.getUnitCount.mockImplementation(() => 1);

    mockUseFaction.mockReturnValue({
      data: {
        id: 'SM',
        slug: 'space-marines',
        name: 'Space Marines',
        datasheets: [datasheet]
      } as any,
      loading: false,
      error: null
    });

    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    expect(screen.queryByTestId('unit-selection-summary')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /review selection/i }));
    });

    const summary = await screen.findByTestId('unit-selection-summary');
    const rowTestId = `selection-item-${datasheet.id}-${datasheet.modelCosts[0].line}`;
    expect(await within(summary).findByTestId(rowTestId)).toBeInTheDocument();
  });

  it('renders mobile back button', async () => {
    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    const editLink = screen.getByText('Back to Roster');
    expect(editLink.closest('a')).toHaveAttribute('href', '/rosters/test-roster-id/edit');
  });

  it('shows unit selection summary when units are selected', async () => {
    const mockUnit = createMockRosterUnit();
    mockUnitSelection.hasSelection = true;
    mockUnitSelection.selectedUnits = [mockUnit];
    mockUnitSelection.totalSelectedPoints = 100;

    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    expect(screen.queryByTestId('unit-selection-summary')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /review selection/i }));
    });

    const summary = await screen.findByTestId('unit-selection-summary');
    expect(within(summary).getByText('Selection Summary')).toBeInTheDocument();
    expect(within(summary).getByText('1 unit • 100 pts')).toBeInTheDocument();
  });

  it('hides unit selection summary when no units selected', async () => {
    mockUnitSelection.hasSelection = false;

    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    expect(screen.queryByRole('button', { name: /review selection/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('unit-selection-summary')).not.toBeInTheDocument();
  });

  it('handles missing faction name gracefully', async () => {
    mockRosterContext.state = {
      ...mockRosterContext.state,
      id: 'test-roster-id',
      factionId: 'SM',
      factionSlug: 'space-marines',
      faction: { id: 'SM', slug: 'space-marines', name: '' }
    };

    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    // Should fall back to faction ID
    expect(screen.getByText('space-marines')).toBeInTheDocument();
  });

  it('filters out legends and forge world datasheets when disabled in settings', async () => {
    const regularUnit = createMockDatasheet({
      id: 'regular-unit',
      slug: 'regular-unit',
      name: 'Regular Unit',
      isLegends: false,
      isForgeWorld: false
    });

    const legendsUnit = createMockDatasheet({
      id: 'legends-unit',
      slug: 'legends-unit',
      name: 'Legends Unit',
      isLegends: true,
      isForgeWorld: false
    });

    const forgeWorldUnit = createMockDatasheet({
      id: 'forge-world-unit',
      slug: 'forge-world-unit',
      name: 'Forge World Unit',
      isLegends: false,
      isForgeWorld: true
    });

    mockAppState.state = {
      settings: {
        showLegends: false,
        showForgeWorld: false
      }
    };

    mockUseFaction.mockReturnValue({
      data: {
        id: 'SM',
        slug: 'space-marines',
        name: 'Space Marines',
        datasheets: [regularUnit, legendsUnit, forgeWorldUnit]
      } as any,
      loading: false,
      error: null
    });

    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('datasheet-item')).toHaveLength(1);
    });

    expect(screen.getByText('Regular Unit')).toBeInTheDocument();
    expect(screen.queryByText('Legends Unit')).not.toBeInTheDocument();
    expect(screen.queryByText('Forge World Unit')).not.toBeInTheDocument();
  });

  it('renders legends and forge world tags when enabled in settings', async () => {
    const legendsUnit = createMockDatasheet({
      id: 'legends-unit',
      slug: 'legends-unit',
      name: 'Legends Unit',
      isLegends: true,
      isForgeWorld: false
    });

    const forgeWorldUnit = createMockDatasheet({
      id: 'forge-world-unit',
      slug: 'forge-world-unit',
      name: 'Forge World Unit',
      isLegends: false,
      isForgeWorld: true
    });

    mockAppState.state = {
      settings: {
        showLegends: true,
        showForgeWorld: true
      }
    };

    mockUseFaction.mockReturnValue({
      data: {
        id: 'SM',
        slug: 'space-marines',
        name: 'Space Marines',
        datasheets: [legendsUnit, forgeWorldUnit]
      } as any,
      loading: false,
      error: null
    });

    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('datasheet-item')).toHaveLength(2);
    });

    expect(screen.getByText('Legends Unit')).toBeInTheDocument();
    expect(screen.getByText('Forge World Unit')).toBeInTheDocument();
    expect(screen.getByText('Warhammer Legends')).toBeInTheDocument();
    expect(screen.getByText('Forge World')).toBeInTheDocument();
  });
});
