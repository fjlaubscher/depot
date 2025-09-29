import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { depot } from '@depot/core';
import Faction from './index';
import { TestWrapper } from '@/test/test-utils';
import type { AppContextType } from '@/contexts/app/types';
import { createMockFaction, createMockDatasheet } from '@/test/mock-data';

// Mock dependencies
vi.mock('@/hooks/use-faction');
vi.mock('@/contexts/toast/use-toast-context');
vi.mock('@/contexts/app/use-app-context');
vi.mock('@/utils/faction', () => ({
  getFactionAlliance: vi.fn(() => 'Imperium')
}));

// Mock child components
vi.mock('./components/faction-datasheets', () => ({
  default: ({ datasheets }: { datasheets: depot.Datasheet[] }) => (
    <div data-testid="faction-datasheets">Datasheets: {datasheets.length}</div>
  )
}));

vi.mock('./components/faction-detachments', () => ({
  default: ({ detachmentAbilities }: { detachmentAbilities: depot.DetachmentAbility[] }) => (
    <div data-testid="faction-detachments">Detachments: {detachmentAbilities.length}</div>
  )
}));

// Mock react-router-dom params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ factionSlug: 'space-marines' })
  };
});

const mockFaction: depot.Faction = createMockFaction({
  datasheets: [
    createMockDatasheet({
      id: 'captain',
      slug: 'captain',
      name: 'Captain',
      role: 'HQ'
    })
  ]
});

describe('Faction Page', () => {
  const mockUseFaction = vi.fn();
  const mockUseAppContext = vi.fn();
  const mockUpdateMyFactions = vi.fn();
  const mockShowToast = vi.fn();
  const mockUseToast = vi.fn();

  const defaultAppContext: AppContextType = {
    state: {
      factionIndex: null,
      offlineFactions: [],
      myFactions: [],
      loading: false,
      error: null,
      settings: null
    },
    dispatch: vi.fn(),
    getFaction: vi.fn(),
    clearOfflineData: vi.fn(),
    updateSettings: vi.fn(),
    updateMyFactions: mockUpdateMyFactions
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mocks
    mockUseFaction.mockReturnValue({
      data: mockFaction,
      loading: false,
      error: null
    });

    mockUseAppContext.mockReturnValue(defaultAppContext);

    mockUseToast.mockReturnValue({
      showToast: mockShowToast,
      removeToast: vi.fn(),
      clearAllToasts: vi.fn(),
      state: { toasts: [] },
      dispatch: vi.fn()
    });

    // Apply mocks
    const useFactionMock = await import('@/hooks/use-faction');
    vi.mocked(useFactionMock.default).mockImplementation(mockUseFaction);

    const useAppContextMock = await import('@/contexts/app/use-app-context');
    vi.mocked(useAppContextMock.useAppContext).mockImplementation(mockUseAppContext);

    const useToastMock = await import('@/contexts/toast/use-toast-context');
    vi.mocked(useToastMock.useToast).mockImplementation(mockUseToast);
  });

  it('renders faction name and alliance', () => {
    render(<Faction />, { wrapper: TestWrapper });

    expect(screen.getByText('Space Marines')).toBeInTheDocument();
    expect(screen.getByText('Imperium')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    mockUseFaction.mockReturnValue({
      data: null,
      loading: true,
      error: null
    });

    render(<Faction />, { wrapper: TestWrapper });

    // Layout component should handle loading state display
    expect(screen.queryByText('Space Marines')).not.toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseFaction.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load faction'
    });

    render(<Faction />, { wrapper: TestWrapper });

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    render(<Faction />, { wrapper: TestWrapper });

    expect(screen.getByText('Datasheets')).toBeInTheDocument();
    expect(screen.getByText('Detachments')).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    render(<Faction />, { wrapper: TestWrapper });

    // Should start with datasheets tab active
    expect(screen.getByTestId('faction-datasheets')).toBeInTheDocument();

    // Click on stratagems tab
    fireEvent.click(screen.getByText('Detachments'));

    await waitFor(() => {
      expect(screen.getByTestId('faction-detachments')).toBeInTheDocument();
    });
  });

  it('handles favourite toggle when not favourite', async () => {
    mockUpdateMyFactions.mockResolvedValue(undefined);

    render(<Faction />, { wrapper: TestWrapper });

    const favouriteButton = screen.getByRole('button', { name: /add to my factions/i });
    fireEvent.click(favouriteButton);

    await waitFor(() => {
      expect(mockUpdateMyFactions).toHaveBeenCalledWith([
        { id: 'SM', slug: 'space-marines', name: 'Space Marines' }
      ]);
    });
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'success',
      title: 'Success',
      message: 'Space Marines added to My Factions.'
    });
  });

  it('handles favourite toggle when already favourite', async () => {
    mockUpdateMyFactions.mockResolvedValue(undefined);
    const contextWithMyFaction = {
      ...defaultAppContext,
      state: {
        ...defaultAppContext.state,
        myFactions: [{ id: 'SM', slug: 'space-marines', name: 'Space Marines' }]
      }
    };
    mockUseAppContext.mockReturnValue(contextWithMyFaction);

    render(<Faction />, { wrapper: TestWrapper });

    const favouriteButton = screen.getByRole('button', { name: /remove from my factions/i });
    fireEvent.click(favouriteButton);

    await waitFor(() => {
      expect(mockUpdateMyFactions).toHaveBeenCalledWith([]);
    });
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'success',
      title: 'Success',
      message: 'Space Marines removed from My Factions.'
    });
  });

  it('displays correct data counts in child components', () => {
    render(<Faction />, { wrapper: TestWrapper });

    expect(screen.getByTestId('faction-datasheets')).toBeInTheDocument();

    // Switch to other tabs to test data passing
    fireEvent.click(screen.getByText('Detachments'));
    expect(screen.getByTestId('faction-detachments')).toBeInTheDocument();
  });

  it('shows unfilled star when not my faction', () => {
    render(<Faction />, { wrapper: TestWrapper });

    const button = screen.getByRole('button', { name: /add to my factions/i });
    expect(button).toBeInTheDocument();
  });

  it('shows filled star when is my faction', () => {
    const contextWithMyFaction = {
      ...defaultAppContext,
      state: {
        ...defaultAppContext.state,
        myFactions: [{ id: 'SM', slug: 'space-marines', name: 'Space Marines' }]
      }
    };
    mockUseAppContext.mockReturnValue(contextWithMyFaction);

    render(<Faction />, { wrapper: TestWrapper });

    const button = screen.getByRole('button', { name: /remove from my factions/i });
    expect(button).toBeInTheDocument();
  });
});
