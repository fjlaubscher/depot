import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { depot } from '@depot/core';
import { TestWrapper } from '@/test/test-utils';
import { createMockRoster, createMockRosterUnit, mockEmptyRoster } from '@/test/mock-data';
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
    factionId: 'SM',
    factionSlug: 'space-marines',
    faction: {
      id: 'SM',
      slug: 'space-marines',
      name: 'Space Marines',
      path: '/data/space-marines.json'
    } as depot.Index,
    detachment: {
      slug: 'gladius-task-force',
      name: 'Gladius Task Force',
      abilities: [],
      enhancements: [],
      stratagems: []
    } as depot.Detachment,
    warlordUnitId: null,
    units: [] as depot.RosterUnit[],
    enhancements: [],
    points: { current: 0, max: 2000 }
  } as depot.Roster,
  duplicateUnit: vi.fn(),
  removeUnit: vi.fn(),
  updateUnitWargear: vi.fn(),
  updateUnitModelCost: vi.fn(),
  applyEnhancement: vi.fn(),
  removeEnhancement: vi.fn(),
  setWarlord: vi.fn(),
  updateRosterDetails: vi.fn()
}));

vi.mock('@/contexts/roster/context', () => ({
  RosterProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="roster-provider">{children}</div>
  )
}));

vi.mock('@/contexts/roster/use-roster-context', () => ({
  useRoster: () => mockRosterContext
}));

// Mock toast context
const mockShowToast = vi.fn();
vi.mock('@/contexts/toast/use-toast-context', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}));

// Mock roster utils
const mockGroupRosterUnitsByRole = vi.hoisted(() =>
  vi.fn((units: depot.RosterUnit[]) => {
    if (units.length === 0) {
      return {};
    }
    return {
      CHARACTER: units
    };
  })
);

const mockGenerateRosterMarkdown = vi.hoisted(() => vi.fn(() => 'mock markdown'));

vi.mock('@/utils/roster', async () => {
  const actual = await vi.importActual<typeof import('@/utils/roster')>('@/utils/roster');

  return {
    ...actual,
    groupRosterUnitsByRole: mockGroupRosterUnitsByRole,
    generateRosterMarkdown: mockGenerateRosterMarkdown
  };
});

// Mock RosterUnitCardEdit
vi.mock('@/components/shared/roster', async () => {
  const actual = await vi.importActual('@/components/shared/roster');
  return {
    ...actual,
    RosterUnitCardEdit: ({
      unit,
      onDuplicate,
      onRemove
    }: {
      unit: depot.RosterUnit;
      onDuplicate: (unit: depot.RosterUnit) => void;
      onRemove: (unitId: string) => void;
    }) => (
      <div data-testid="roster-unit-card-edit" data-unit-name={unit.datasheet.name}>
        <span>{unit.datasheet.name}</span>
        <button onClick={() => onDuplicate(unit)} data-testid="duplicate-unit">
          Duplicate
        </button>
        <button onClick={() => onRemove(unit.id)} data-testid="remove-unit">
          Remove
        </button>
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
      factionId: 'SM',
      factionSlug: 'space-marines',
      faction: {
        id: 'SM',
        slug: 'space-marines',
        name: 'Space Marines',
        path: '/data/space-marines.json'
      } as depot.Index,
      detachment: {
        slug: 'gladius-task-force',
        name: 'Gladius Task Force',
        abilities: [],
        enhancements: [],
        stratagems: []
      } as depot.Detachment,
      warlordUnitId: null,
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

  it('renders page header with edit action', () => {
    render(<EditRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit roster details')).toBeInTheDocument();
  });

  it('renders mobile back button', () => {
    render(<EditRosterPage />, { wrapper: TestWrapper });

    const backLink = screen.getByText('Rosters');
    expect(backLink.closest('a')).toHaveAttribute('href', '/rosters');
  });

  it('displays empty state when roster has no units', () => {
    mockRosterContext.state = mockEmptyRoster;

    render(<EditRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('empty-roster-state')).toBeInTheDocument();
    expect(screen.getByText('No units in this roster')).toBeInTheDocument();
  });

  it('shows add units button when roster is empty', () => {
    mockRosterContext.state = mockEmptyRoster;

    render(<EditRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('add-units-button')).toBeInTheDocument();
    expect(screen.getByTestId('view-roster-button')).toBeInTheDocument();
  });

  it('handles unit duplication correctly', () => {
    const testUnit = createMockRosterUnit({ id: 'test-unit-1' });
    mockRosterContext.state = createMockRoster({
      units: [testUnit]
    });

    render(<EditRosterPage />, { wrapper: TestWrapper });

    const duplicateButton = screen.getByTestId('duplicate-unit');
    fireEvent.click(duplicateButton);

    expect(mockRosterContext.duplicateUnit).toHaveBeenCalledWith(testUnit);
  });

  it('handles unit removal correctly', () => {
    const testUnit = createMockRosterUnit({ id: 'test-unit-1' });
    mockRosterContext.state = createMockRoster({
      units: [testUnit]
    });

    render(<EditRosterPage />, { wrapper: TestWrapper });

    const removeButton = screen.getByTestId('remove-unit');
    fireEvent.click(removeButton);

    expect(mockRosterContext.removeUnit).toHaveBeenCalledWith(testUnit.id);
  });

  it('displays correct points tracking', () => {
    mockRosterContext.state = createMockRoster({
      points: { current: 1500, max: 2000 }
    });

    render(<EditRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('points-display')).toHaveTextContent('1500/2000');
  });

  it('handles roster with multiple units', () => {
    const unit1 = createMockRosterUnit({ id: 'unit-1' });
    const unit2 = createMockRosterUnit({ id: 'unit-2' });
    mockRosterContext.state = createMockRoster({
      units: [unit1, unit2]
    });

    render(<EditRosterPage />, { wrapper: TestWrapper });

    // Should show CHARACTER section with unit count
    expect(screen.getByTestId('unit-role-section')).toBeInTheDocument();
    expect(screen.getByText('CHARACTER (2)')).toBeInTheDocument();
  });
});
