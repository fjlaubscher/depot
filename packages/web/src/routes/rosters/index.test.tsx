import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { depot } from '@depot/core';
import { TestWrapper } from '@/test/test-utils';
import { mockRoster, createMockRoster } from '@/test/mock-data';
import Rosters from './index';

// Mock AppLayout to avoid sidebar duplication
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
    useNavigate: () => mockNavigate
  };
});

// Mock useRosters hook
const mockUseRosters = vi.hoisted(() => ({
  rosters: [] as depot.Roster[],
  loading: false,
  error: null as string | null,
  deleteRoster: vi.fn(),
  duplicateRoster: vi.fn()
}));

vi.mock('@/hooks/use-rosters', () => ({
  default: () => mockUseRosters
}));

describe('Rosters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRosters.rosters = [];
    mockUseRosters.loading = false;
    mockUseRosters.error = null;
    mockUseRosters.deleteRoster = vi.fn();
    mockUseRosters.duplicateRoster = vi.fn();
  });

  it('renders page header with create button', () => {
    render(<Rosters />, { wrapper: TestWrapper });

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('page-header-action')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseRosters.loading = true;

    render(<Rosters />, { wrapper: TestWrapper });

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseRosters.error = 'Failed to load rosters';

    render(<Rosters />, { wrapper: TestWrapper });

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('page-header-action')).toBeInTheDocument();
  });

  it('shows empty state when no rosters exist', () => {
    mockUseRosters.rosters = [];

    render(<Rosters />, { wrapper: TestWrapper });

    expect(screen.getByTestId('empty-rosters')).toBeInTheDocument();
  });

  it('displays rosters in grid layout', () => {
    const testRosters = [
      createMockRoster({
        id: 'roster-1',
        name: 'Space Marines List',
        points: { current: 1500, max: 2000 }
      }),
      createMockRoster({
        id: 'roster-2',
        name: 'Chaos Marines List',
        points: { current: 1800, max: 2000 }
      })
    ];

    mockUseRosters.rosters = testRosters;

    render(<Rosters />, { wrapper: TestWrapper });

    expect(screen.getByTestId('rosters-grid')).toBeInTheDocument();
    expect(screen.getAllByTestId('roster-card')).toHaveLength(2);
  });

  it('navigates to create roster page when create button is clicked', async () => {
    const user = userEvent.setup();

    render(<Rosters />, { wrapper: TestWrapper });

    await user.click(screen.getByTestId('page-header-action'));

    expect(mockNavigate).toHaveBeenCalledWith('/rosters/create');
  });

  it('creates RosterCards with correct data for each roster', () => {
    const testRosters = [
      createMockRoster({ id: 'roster-1', name: 'Test Roster 1' }),
      createMockRoster({ id: 'roster-2', name: 'Test Roster 2' })
    ];

    mockUseRosters.rosters = testRosters;

    render(<Rosters />, { wrapper: TestWrapper });

    const rosterCards = screen.getAllByTestId('roster-card');
    expect(rosterCards).toHaveLength(2);
  });

  it('displays single roster correctly', () => {
    const testRoster = createMockRoster({
      name: 'Single Test Roster',
      points: { current: 0, max: 1500 }
    });

    mockUseRosters.rosters = [testRoster];

    render(<Rosters />, { wrapper: TestWrapper });

    expect(screen.getByTestId('rosters-grid')).toBeInTheDocument();
    expect(screen.getAllByTestId('roster-card')).toHaveLength(1);
  });

  it('handles multiple rosters correctly', () => {
    const testRosters = [
      createMockRoster({ id: 'roster-1', name: 'Roster 1' }),
      createMockRoster({ id: 'roster-2', name: 'Roster 2' }),
      createMockRoster({ id: 'roster-3', name: 'Roster 3' })
    ];

    mockUseRosters.rosters = testRosters;

    render(<Rosters />, { wrapper: TestWrapper });

    expect(screen.getAllByTestId('roster-card')).toHaveLength(3);
  });

  it('maintains create button accessibility in all states', () => {
    // Test loading state
    mockUseRosters.loading = true;
    const { rerender } = render(<Rosters />, { wrapper: TestWrapper });
    expect(screen.getByTestId('page-header-action')).toBeInTheDocument();

    // Test error state
    mockUseRosters.loading = false;
    mockUseRosters.error = 'Error message';
    rerender(<Rosters />);
    expect(screen.getByTestId('page-header-action')).toBeInTheDocument();

    // Test success state
    mockUseRosters.error = null;
    mockUseRosters.rosters = [mockRoster];
    rerender(<Rosters />);
    expect(screen.getByTestId('page-header-action')).toBeInTheDocument();
  });
});
