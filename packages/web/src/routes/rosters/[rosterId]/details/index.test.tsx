import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import type { depot } from '@depot/core';

import { TestWrapper } from '@/test/test-utils';
import {
  createMockDetachment,
  createMockFaction,
  createMockRoster,
  mockEmptyRoster
} from '@/test/mock-data';
import RosterDetailsPage from './index';

// Mock AppLayout
vi.mock('@/components/layout', () => ({
  default: ({ children, title }: { children: ReactNode; title: string }) => (
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

// Mock roster context
const mockUpdateRosterDetails = vi.fn();
let mockRosterContext!: {
  state: depot.Roster;
  updateRosterDetails: typeof mockUpdateRosterDetails;
};

vi.mock('@/contexts/roster/context', () => ({
  RosterProvider: ({ children }: { children: ReactNode }) => (
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

// Mock faction hook
type FactionResult = { data: depot.Faction | undefined; loading: boolean; error: string | null };

const detachments = [
  createMockDetachment({ slug: 'gladius-task-force', name: 'Gladius Task Force' }),
  createMockDetachment({ slug: 'ironstorm-spearhead', name: 'Ironstorm Spearhead' })
];

const mockUseFaction = vi.hoisted(() => vi.fn<() => FactionResult>());

vi.mock('@/hooks/use-faction', () => ({
  default: mockUseFaction
}));

const renderPage = () => render(<RosterDetailsPage />, { wrapper: TestWrapper });

describe('RosterDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRosterContext = {
      state: createMockRoster({
        id: 'test-roster-id',
        name: 'Test Roster',
        detachment: createMockDetachment({
          slug: 'gladius-task-force',
          name: 'Gladius Task Force'
        }),
        points: { current: 80, max: 2000 }
      }),
      updateRosterDetails: mockUpdateRosterDetails
    };
    mockUpdateRosterDetails.mockReset();
    mockUseFaction.mockReturnValue({
      data: createMockFaction({ detachments }),
      loading: false,
      error: null
    });
  });

  it('renders loader when roster data is still loading', () => {
    mockRosterContext.state = { ...mockEmptyRoster, id: '' };
    mockUseFaction.mockReturnValueOnce({ data: undefined, loading: true, error: null });

    renderPage();

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders roster details form with existing data', () => {
    renderPage();

    expect(screen.getByDisplayValue('Test Roster')).toBeInTheDocument();
    expect(screen.getByText('Gladius Task Force')).toBeInTheDocument();
    expect(screen.queryByText('Roster details have been saved.')).not.toBeInTheDocument();
    expect(screen.getByTestId('max-points-field-select')).toBeInTheDocument();
  });

  it('updates roster details when form is submitted', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.clear(screen.getByLabelText('Roster Name'));
    await user.type(screen.getByLabelText('Roster Name'), 'Updated Name');
    await user.selectOptions(screen.getByTestId('detachment-select-select'), 'ironstorm-spearhead');
    await user.selectOptions(screen.getByTestId('max-points-field-select'), 'incursion');

    await user.click(screen.getByTestId('save-roster-details'));

    expect(mockUpdateRosterDetails).toHaveBeenCalledWith({
      name: 'Updated Name',
      detachment: detachments[1],
      maxPoints: 1000
    });
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'success',
      title: 'Roster Updated',
      message: 'Roster details have been saved.'
    });
  });

  it('shows validation error when name is empty', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.clear(screen.getByLabelText('Roster Name'));
    fireEvent.submit(screen.getByTestId('roster-details-form'));

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      title: 'Validation Error',
      message: 'Please enter a roster name.'
    });
    expect(mockUpdateRosterDetails).not.toHaveBeenCalled();
    expect(screen.getByTestId('save-roster-details')).toBeDisabled();
  });
});
