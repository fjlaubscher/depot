import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '@/test/test-utils';
import { mockRoster } from '@/test/mock-data';
import ViewRosterPage from './index';

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
const mockRosterState = vi.hoisted(() => ({
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
  loading: false,
  error: null
}));

vi.mock('@/contexts/roster/context', () => ({
  RosterProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="roster-provider">{children}</div>
  )
}));

vi.mock('@/contexts/roster/use-roster-context', () => ({
  useRoster: () => mockRosterState
}));

// Mock useAppContext
const mockAppState = vi.hoisted(() => ({
  state: {
    factionIndex: [
      { id: 'space-marines', name: 'Space Marines' }
    ]
  }
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

// Mock roster utils
const mockGroupRosterUnitsByRole = vi.hoisted(() => vi.fn());
vi.mock('@/utils/roster', () => ({
  generateRosterMarkdown: vi.fn(() => 'mock markdown'),
  groupRosterUnitsByRole: mockGroupRosterUnitsByRole
}));

// Mock ViewRosterUnitCard
vi.mock('./components/view-roster-unit-card', () => ({
  default: ({ unit }: { unit: any }) => (
    <div data-testid="view-roster-unit-card" data-unit-name={unit.datasheet.name}>
      {unit.datasheet.name}
    </div>
  )
}));

describe('ViewRosterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRosterState.state = {
      id: 'test-roster-id',
      name: 'Test Roster',
      factionId: 'space-marines',
      faction: { id: 'space-marines', name: 'Space Marines' },
      detachment: { name: 'Gladius Task Force' },
      units: [],
      enhancements: [],
      points: { current: 0, max: 2000 }
    };
    mockRosterState.loading = false;
    mockRosterState.error = null;

    // Default mock for empty roster
    mockGroupRosterUnitsByRole.mockReturnValue({});
  });

  it('renders loading state when roster has no id', () => {
    mockRosterState.state = { ...mockRosterState.state, id: '' };

    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders roster view with provider wrapper', () => {
    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    expect(screen.getByTestId('roster-provider')).toBeInTheDocument();
  });

  it('displays roster header information', () => {
    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByText('Test Roster')).toBeInTheDocument();
    expect(screen.getByText('Space Marines • Gladius Task Force')).toBeInTheDocument();
  });

  it('renders page header with edit action', () => {
    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    const editButton = screen.getByLabelText('Edit roster');
    expect(editButton).toBeInTheDocument();
  });

  it('renders export and share buttons', () => {
    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('displays units in sections by role', () => {
    // Mock roster with units and grouped units
    mockRosterState.state = {
      ...mockRosterState.state,
      units: [{ id: 'unit-1', datasheet: { name: 'Test Unit' } }]
    };
    mockGroupRosterUnitsByRole.mockReturnValue({
      HQ: [{ id: 'unit-1', datasheet: { name: 'Test Unit' } }]
    });

    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByText('HQ (1)')).toBeInTheDocument();
    expect(screen.getByTestId('view-roster-unit-card')).toBeInTheDocument();
  });

  it('shows empty state when no units', () => {
    mockRosterState.state = { ...mockRosterState.state, units: [] };

    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByText('No units in this roster')).toBeInTheDocument();
    expect(screen.getByText('Use the edit button to start building your roster')).toBeInTheDocument();
  });

  it('renders mobile back button', () => {
    render(<ViewRosterPage />, { wrapper: TestWrapper });

    const backLink = screen.getByText('Rosters');
    expect(backLink.closest('a')).toHaveAttribute('href', '/rosters');
  });

  it('handles missing faction name gracefully', () => {
    mockAppState.state.factionIndex = [];

    render(<ViewRosterPage />, { wrapper: TestWrapper });

    // Should fall back to faction ID
    expect(screen.getByText('space-marines')).toBeInTheDocument();
  });
});
