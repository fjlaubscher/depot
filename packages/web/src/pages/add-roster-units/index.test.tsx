import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { TestWrapper } from '@/test/test-utils';
import { createMockRosterUnit, createMockDatasheet } from '@/test/mock-data';
import AddRosterUnitsPage from './index';

// Mock AppLayout
vi.mock('@/components/layout', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="app-layout" data-title={title}>
      {children}
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

// Mock DatasheetBrowser component
vi.mock('@/components/shared/datasheet', async () => {
  const actual = await vi.importActual<typeof import('@/components/shared/datasheet')>(
    '@/components/shared/datasheet'
  );

  return {
    ...actual,
    DatasheetBrowser: ({
      datasheets,
      renderDatasheet
    }: {
      datasheets: any[];
      renderDatasheet?: (datasheet: any) => React.ReactNode;
    }) => (
      <div data-testid="datasheet-browser">
        {datasheets.map((datasheet) => (
          <div key={datasheet.id} data-testid="datasheet-item">
            {renderDatasheet ? renderDatasheet(datasheet) : datasheet.name}
          </div>
        ))}
      </div>
    )
  };
});

describe('AddRosterUnitsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRosterContext.state = {
      id: 'test-roster-id',
      name: 'Test Roster',
      factionId: 'SM',
      factionSlug: 'space-marines',
      faction: { id: 'SM', slug: 'space-marines', name: 'Space Marines' },
      detachment: { name: 'Gladius Task Force' },
      units: [],
      enhancements: [],
      points: { current: 0, max: 2000 }
    };
    mockUnitSelection.selectedUnits = [];
    mockUnitSelection.hasSelection = false;
    mockUnitSelection.totalSelectedPoints = 0;
    mockAppState.state = {
      settings: {
        showLegends: false,
        showForgeWorld: false
      }
    };
    mockAppState.getFaction.mockResolvedValue({
      id: 'SM',
      slug: 'space-marines',
      name: 'Space Marines',
      datasheets: []
    });
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

    expect(screen.getByText('Add Units')).toBeInTheDocument();
    expect(screen.getByText('Space Marines • Gladius Task Force')).toBeInTheDocument();
  });

  it('renders page header with back navigation', async () => {
    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByText('Add Units')).toBeInTheDocument();
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

    expect(screen.getByText('1 unit selected')).toBeInTheDocument();
    expect(screen.getByText('Total: 100 pts')).toBeInTheDocument();
  });

  it('hides unit selection summary when no units selected', async () => {
    mockUnitSelection.hasSelection = false;

    await act(async () => {
      render(<AddRosterUnitsPage />, { wrapper: TestWrapper });
    });

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

    mockAppState.getFaction.mockResolvedValue({
      id: 'SM',
      slug: 'space-marines',
      name: 'Space Marines',
      datasheets: [regularUnit, legendsUnit, forgeWorldUnit]
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

    mockAppState.getFaction.mockResolvedValue({
      id: 'SM',
      slug: 'space-marines',
      name: 'Space Marines',
      datasheets: [legendsUnit, forgeWorldUnit]
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
