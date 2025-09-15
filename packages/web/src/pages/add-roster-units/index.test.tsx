import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '@/test/test-utils';
import { mockDatasheet } from '@/test/mock-data';
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
    factionId: 'space-marines',
    faction: { id: 'space-marines', name: 'Space Marines' },
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
  getFaction: vi.fn().mockResolvedValue({
    id: 'space-marines',
    name: 'Space Marines',
    datasheets: []
  })
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

// Mock useRosterUnitSelection hook
const mockUnitSelection = vi.hoisted(() => ({
  selectedUnits: [],
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
vi.mock('@/components/shared/datasheet', () => ({
  DatasheetBrowser: ({ datasheets, renderDatasheet }: {
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
  ),
  DatasheetSelectionCard: ({ datasheet, onAdd }: {
    datasheet: any;
    onAdd: (datasheet: any, modelCost: any) => void;
  }) => (
    <div data-testid="datasheet-selection-card" data-datasheet-name={datasheet.name}>
      <span>{datasheet.name}</span>
      <button onClick={() => onAdd(datasheet, datasheet.modelCosts[0])}>
        Add
      </button>
    </div>
  )
}));



describe('AddRosterUnitsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRosterContext.state = {
      id: 'test-roster-id',
      name: 'Test Roster',
      factionId: 'space-marines',
      faction: { id: 'space-marines', name: 'Space Marines' },
      detachment: { name: 'Gladius Task Force' },
      units: [],
      enhancements: [],
      points: { current: 0, max: 2000 }
    };
    mockUnitSelection.selectedUnits = [];
    mockUnitSelection.hasSelection = false;
    mockUnitSelection.totalSelectedPoints = 0;
  });

  it('renders loading state when roster has no id', () => {
    mockRosterContext.state = { ...mockRosterContext.state, id: '' };

    render(<AddRosterUnitsPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders add roster units view with provider wrapper', () => {
    render(<AddRosterUnitsPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    expect(screen.getByTestId('roster-provider')).toBeInTheDocument();
  });

  it('displays roster header information', () => {
    render(<AddRosterUnitsPage />, { wrapper: TestWrapper });

    expect(screen.getByText('Add Units')).toBeInTheDocument();
    expect(screen.getByText('Space Marines • Gladius Task Force')).toBeInTheDocument();
  });

  it('renders page header with back navigation', () => {
    render(<AddRosterUnitsPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByText('Add Units')).toBeInTheDocument();
  });

  it('renders datasheet browser when faction data is loaded', async () => {
    // Set faction data as loaded
    mockRosterContext.state = {
      ...mockRosterContext.state,
      id: 'test-roster-id',
      faction: { id: 'space-marines', name: 'Space Marines' }
    };

    render(<AddRosterUnitsPage />, { wrapper: TestWrapper });

    // Wait for faction data to load and check for datasheet browser
    await vi.waitFor(() => {
      expect(screen.queryByTestId('datasheet-browser')).toBeInTheDocument();
    });
  });

  

  it('renders mobile back button', () => {
    render(<AddRosterUnitsPage />, { wrapper: TestWrapper });

    const editLink = screen.getByText('Back to Roster');
    expect(editLink.closest('a')).toHaveAttribute('href', '/rosters/test-roster-id/edit');
  });

  it('shows unit selection summary when units are selected', () => {
    mockUnitSelection.hasSelection = true;
    mockUnitSelection.selectedUnits = [{
      datasheet: { id: 'test-datasheet', name: 'Test Unit', modelCosts: [{ cost: '100', description: 'Test Model' }] },
      modelCost: { cost: '100', description: 'Test Model' }
    }];
    mockUnitSelection.totalSelectedPoints = 100;

    render(<AddRosterUnitsPage />, { wrapper: TestWrapper });

    expect(screen.getByText('1 unit selected')).toBeInTheDocument();
    expect(screen.getByText('Total: 100 pts')).toBeInTheDocument();
  });

  it('hides unit selection summary when no units selected', () => {
    mockUnitSelection.hasSelection = false;

    render(<AddRosterUnitsPage />, { wrapper: TestWrapper });

    expect(screen.queryByTestId('unit-selection-summary')).not.toBeInTheDocument();
  });

  it('handles missing faction name gracefully', () => {
    mockRosterContext.state = {
      ...mockRosterContext.state,
      id: 'test-roster-id',
      faction: undefined
    };

    render(<AddRosterUnitsPage />, { wrapper: TestWrapper });

    // Should fall back to faction ID
    expect(screen.getByText('space-marines')).toBeInTheDocument();
  });
});