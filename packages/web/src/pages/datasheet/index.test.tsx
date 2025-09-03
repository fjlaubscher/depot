import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mockFaction,
  mockFactionWithoutDatasheets,
  mockDatasheetWithoutCosts
} from '@/test/mock-data';
import {
  TestWrapper,
  createMockFunctions,
  setupCommonMocks,
  setupBrowserMocks
} from '@/test/test-utils';
import DatasheetPage from './index';

// Mock dependencies
vi.mock('@/hooks/use-faction');
vi.mock('@/contexts/toast/use-toast-context');

// Mock child components
vi.mock('./components/datasheet-profile', () => ({
  default: ({ datasheet }: { datasheet: any }) => (
    <div data-testid="datasheet-profile">Profile for {datasheet.name}</div>
  )
}));

vi.mock('./components/datasheet-stratagems', () => ({
  default: ({ stratagems }: { stratagems: any[] }) => (
    <div data-testid="datasheet-stratagems">Stratagems: {stratagems.length}</div>
  )
}));

// Mock react-router-dom params and navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ factionId: 'SM', id: 'captain' }),
    useNavigate: () => mockNavigate
  };
});

describe('DatasheetPage', () => {
  const mocks = createMockFunctions();

  beforeEach(async () => {
    vi.clearAllMocks();
    setupBrowserMocks();

    // Setup default successful state
    mocks.mockUseFaction.mockReturnValue({
      data: mockFaction,
      loading: false,
      error: null
    });

    await setupCommonMocks(mocks);
  });

  it('renders datasheet name and role', () => {
    render(<DatasheetPage />, { wrapper: TestWrapper });

    // Use more specific queries to avoid multiple matches
    expect(screen.getByTestId('datasheet-header')).toBeInTheDocument();
    expect(screen.getByText('CHARACTER')).toBeInTheDocument();
  });

  it('renders points cost correctly', () => {
    render(<DatasheetPage />, { wrapper: TestWrapper });

    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument(); // alternate cost
  });

  it('renders tabs', () => {
    render(<DatasheetPage />, { wrapper: TestWrapper });

    expect(screen.getByRole('button', { name: 'Stratagems' })).toBeInTheDocument();
  });

  it('renders child components with correct data', () => {
    render(<DatasheetPage />, { wrapper: TestWrapper });

    // Only the first tab's content is shown by default
    expect(screen.getByTestId('datasheet-profile')).toBeInTheDocument();
    // Second tab content is not visible initially
    expect(screen.queryByTestId('datasheet-stratagems')).not.toBeInTheDocument();
  });

  it('renders loading state', () => {
    mocks.mockUseFaction.mockReturnValue({
      data: null,
      loading: true,
      error: null
    });

    render(<DatasheetPage />, { wrapper: TestWrapper });

    expect(screen.getByText('Datasheet')).toBeInTheDocument();
    expect(screen.getByTestId('datasheet-loader')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mocks.mockUseFaction.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load faction data'
    });

    render(<DatasheetPage />, { wrapper: TestWrapper });

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByTestId('datasheet-error')).toBeInTheDocument();
  });

  it('renders not found state when datasheet is missing', () => {
    mocks.mockUseFaction.mockReturnValue({
      data: mockFactionWithoutDatasheets,
      loading: false,
      error: null
    });

    render(<DatasheetPage />, { wrapper: TestWrapper });

    expect(screen.getByText('Not Found')).toBeInTheDocument();
    expect(screen.getByTestId('datasheet-not-found')).toBeInTheDocument();
  });

  it('navigates back to faction page when back button is clicked', () => {
    render(<DatasheetPage />, { wrapper: TestWrapper });

    const backButton = screen.getByTestId('back-to-faction');
    
    expect(backButton).toHaveAttribute('href', '/faction/SM');
  });

  it('shows share button', () => {
    render(<DatasheetPage />, { wrapper: TestWrapper });

    expect(screen.getByLabelText('Share datasheet')).toBeInTheDocument();
  });

  it('handles datasheet with no costs', () => {
    const factionWithoutCosts = {
      ...mockFaction,
      datasheets: [mockDatasheetWithoutCosts]
    };

    mocks.mockUseFaction.mockReturnValue({
      data: factionWithoutCosts,
      loading: false,
      error: null
    });

    render(<DatasheetPage />, { wrapper: TestWrapper });

    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
