import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '@/test/test-utils';
import { mockRoster } from '@/test/mock-data';
import EditRosterPage from './index';

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
  duplicateUnit: vi.fn(),
  removeUnit: vi.fn(),
  updateUnitWargear: vi.fn()
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
vi.mock('@/utils/roster', () => ({
  generateRosterMarkdown: vi.fn(() => 'mock markdown'),
  groupRosterUnitsByRole: vi.fn(() => ({
    HQ: [{ id: 'unit-1', datasheet: { name: 'Test Unit' } }]
  }))
}));

// Mock RosterUnitCardEdit
vi.mock('@/components/shared/roster', async () => {
  const actual = await vi.importActual('@/components/shared/roster');
  return {
    ...actual,
    RosterUnitCardEdit: ({ unit, onDuplicate, onRemove }: {
      unit: any;
      onDuplicate: () => void;
      onRemove: () => void;
    }) => (
      <div data-testid="roster-unit-card-edit" data-unit-name={unit.datasheet.name}>
        <span>{unit.datasheet.name}</span>
        <button onClick={onDuplicate} data-testid="duplicate-unit">Duplicate</button>
        <button onClick={onRemove} data-testid="remove-unit">Remove</button>
      </div>
    )
  };
});

describe('EditRosterPage', () => {
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
  });

  it('renders loading state when roster has no id', () => {
    mockRosterContext.state = { ...mockRosterContext.state, id: '' };

    render(<EditRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders edit roster view with provider wrapper', () => {
    render(<EditRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    expect(screen.getByTestId('roster-provider')).toBeInTheDocument();
  });

  it('displays roster header information', () => {
    render(<EditRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByText('Test Roster')).toBeInTheDocument();
    expect(screen.getByText('Space Marines • Gladius Task Force')).toBeInTheDocument();
  });

  it('renders page header with view and add units actions', () => {
    render(<EditRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByLabelText('View roster')).toBeInTheDocument();
  });

  it('renders mobile back button', () => {
    render(<EditRosterPage />, { wrapper: TestWrapper });

    const backLink = screen.getByText('Rosters');
    expect(backLink.closest('a')).toHaveAttribute('href', '/rosters');
  });
});
