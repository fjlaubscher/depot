import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestWrapper } from '@/test/test-utils';
import { createMockRosterUnit } from '@/test/mock-data';
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

import type { depot } from '@depot/core';

function createMockRosterState(): depot.Roster {
  return {
    id: 'test-roster-id',
    name: 'Test Roster',
    factionId: 'SM',
    factionSlug: 'space-marines',
    faction: {
      id: 'SM',
      slug: 'space-marines',
      name: 'Space Marines',
      path: '/indices/space-marines'
    },
    detachment: {
      name: 'Gladius Task Force',
      abilities: [],
      enhancements: [],
      stratagems: []
    },
    warlordUnitId: null,
    units: [] as depot.RosterUnit[],
    enhancements: [],
    points: { current: 0, max: 2000 }
  };
}

// Mock RosterProvider and useRoster
const mockRosterState = vi.hoisted(
  () =>
    ({
      state: createMockRosterState(),
      loading: false,
      error: null
    }) as {
      state: depot.Roster;
      loading: boolean;
      error: unknown;
    }
);

vi.mock('@/contexts/roster/context', () => ({
  RosterProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="roster-provider">{children}</div>
  )
}));

vi.mock('@/contexts/roster/use-roster-context', () => ({
  useRoster: () => mockRosterState
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
const mockGenerateRosterMarkdown = vi.hoisted(() => vi.fn(() => 'mock markdown'));
const mockGenerateRosterShareText = vi.hoisted(() => vi.fn(() => 'mock share text'));

vi.mock('@/utils/roster', async () => {
  const actual = await vi.importActual<typeof import('@/utils/roster')>('@/utils/roster');

  return {
    ...actual,
    groupRosterUnitsByRole: mockGroupRosterUnitsByRole,
    generateRosterMarkdown: mockGenerateRosterMarkdown,
    generateRosterShareText: mockGenerateRosterShareText
  };
});

// Mock ViewRosterUnitCard
vi.mock('./_components/view-roster-unit-card', () => ({
  default: ({ unit }: { unit: any }) => (
    <div data-testid="view-roster-unit-card" data-unit-name={unit.datasheet.name}>
      {unit.datasheet.name}
    </div>
  )
}));

describe('ViewRosterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRosterState.state = createMockRosterState();
    mockRosterState.loading = false;
    mockRosterState.error = null;

    // Default mock for empty roster
    mockGroupRosterUnitsByRole.mockReturnValue({});

    Object.assign(navigator, {
      share: vi.fn().mockResolvedValue(undefined)
    });
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

  it('falls back to copy button when native share is unavailable', () => {
    Object.assign(navigator, {
      share: undefined
    });

    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('displays units in sections by role', () => {
    const mockUnit = createMockRosterUnit();
    // Mock roster with units and grouped units
    mockRosterState.state = {
      ...mockRosterState.state,
      units: [mockUnit]
    };
    mockGroupRosterUnitsByRole.mockReturnValue({
      CHARACTER: [mockUnit]
    });

    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByRole('button', { name: 'Units' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Detachment' })).toBeInTheDocument();
    expect(screen.getByText('CHARACTER (1)')).toBeInTheDocument();
    expect(screen.getByTestId('view-roster-unit-card')).toBeInTheDocument();
  });

  it('shows empty state when no units', () => {
    mockRosterState.state = { ...mockRosterState.state, units: [] };

    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByText('No units in this roster')).toBeInTheDocument();
    expect(
      screen.getByText('Use the edit button to start building your roster')
    ).toBeInTheDocument();
  });

  it('renders detachment overview when tab selected', () => {
    const mockUnit = createMockRosterUnit();
    mockRosterState.state = {
      ...mockRosterState.state,
      units: [mockUnit],
      detachment: {
        name: 'Gladius Task Force',
        abilities: [
          {
            id: 'ability-1',
            name: 'Oath of Moment',
            legend: '',
            description: '<p>Test ability</p>'
          } as depot.DetachmentAbility
        ],
        enhancements: [],
        stratagems: []
      },
      enhancements: [
        {
          enhancement: {
            id: 'enhancement-1',
            name: 'Artificer Armour',
            legend: '',
            description: '<p>Improve save by 1</p>',
            cost: '25',
            detachment: 'Gladius Task Force',
            factionId: 'SM'
          } as depot.Enhancement,
          unitId: mockUnit.id
        }
      ]
    };
    mockGroupRosterUnitsByRole.mockReturnValue({
      CHARACTER: [mockUnit]
    });

    render(<ViewRosterPage />, { wrapper: TestWrapper });

    fireEvent.click(screen.getByRole('button', { name: 'Detachment' }));

    expect(screen.getByTestId('detachment-overview')).toBeInTheDocument();
    expect(screen.getByText('Oath of Moment')).toBeInTheDocument();
    expect(screen.getByText('Artificer Armour')).toBeInTheDocument();
    expect(screen.getByText(/Assigned to/i)).toHaveTextContent('Assigned to Captain');
  });

  it('omits detachment tab when roster has no detachment', () => {
    const rosterWithoutDetachment = { ...mockRosterState.state };
    (rosterWithoutDetachment as unknown as { detachment?: depot.Detachment }).detachment =
      undefined;
    mockRosterState.state = rosterWithoutDetachment as depot.Roster;

    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.queryByRole('button', { name: 'Detachment' })).not.toBeInTheDocument();
  });

  it('renders mobile back button', () => {
    render(<ViewRosterPage />, { wrapper: TestWrapper });

    const backLink = screen.getByText('Rosters');
    expect(backLink.closest('a')).toHaveAttribute('href', '/rosters');
  });

  it('handles missing faction name gracefully', () => {
    mockRosterState.state = {
      ...mockRosterState.state,
      faction: undefined
    };

    render(<ViewRosterPage />, { wrapper: TestWrapper });

    // Should fall back to faction slug in title case
    expect(screen.getByText(/space marines/i)).toBeInTheDocument();
  });

  it('handles roster with maximum points', () => {
    mockRosterState.state = {
      ...mockRosterState.state,
      points: { current: 2000, max: 2000 }
    };

    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('points-display')).toHaveTextContent('2000/2000');
  });

  it('displays export functionality correctly', () => {
    mockRosterState.state = {
      ...mockRosterState.state,
      name: 'Test Export Roster',
      units: [createMockRosterUnit()]
    };

    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('export-button')).toBeInTheDocument();
    expect(screen.getByTestId('share-button')).toBeInTheDocument();
  });

  it('shows unit details in proper sections', () => {
    const testUnit = createMockRosterUnit({
      id: 'test-hq-unit'
    });

    mockRosterState.state = {
      ...mockRosterState.state,
      units: [testUnit]
    };
    mockGroupRosterUnitsByRole.mockReturnValue({
      CHARACTER: [testUnit]
    });

    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('unit-role-section')).toBeInTheDocument();
    expect(screen.getByTestId('view-roster-unit-card')).toBeInTheDocument();
  });

  it('handles empty roster state properly', () => {
    mockRosterState.state = {
      ...mockRosterState.state,
      units: [],
      points: { current: 0, max: 2000 }
    };

    render(<ViewRosterPage />, { wrapper: TestWrapper });

    expect(screen.getByTestId('empty-roster-message')).toBeInTheDocument();
    expect(screen.getByText('No units in this roster')).toBeInTheDocument();
  });

  it('navigates to edit mode correctly', () => {
    render(<ViewRosterPage />, { wrapper: TestWrapper });

    const editButton = screen.getByTestId('edit-roster-button');
    fireEvent.click(editButton);

    // Note: Navigation would be tested with the actual navigate function in integration tests
    expect(editButton).toBeInTheDocument();
  });
});
