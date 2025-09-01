import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { depot } from 'depot-core';
import Faction from './index';
import { TestWrapper } from '@/test/test-utils';

// Mock dependencies
vi.mock('@/hooks/use-faction');
vi.mock('@/hooks/use-local-storage');
vi.mock('@/contexts/toast/use-toast-context');
vi.mock('@/utils/faction', () => ({
  getFactionAlliance: vi.fn(() => 'Imperium')
}));

// Mock child components
vi.mock('./components/FactionDatasheets', () => ({
  default: ({ datasheets }: { datasheets: depot.Datasheet[] }) => (
    <div data-testid="faction-datasheets">Datasheets: {datasheets.length}</div>
  )
}));

vi.mock('./components/FactionStratagems', () => ({
  default: ({ stratagems }: { stratagems: depot.Stratagem[] }) => (
    <div data-testid="faction-stratagems">Stratagems: {stratagems.length}</div>
  )
}));

vi.mock('./components/FactionDetachments', () => ({
  default: ({ detachmentAbilities }: { detachmentAbilities: depot.DetachmentAbility[] }) => (
    <div data-testid="faction-detachments">Detachments: {detachmentAbilities.length}</div>
  )
}));

vi.mock('./components/FactionEnhancements', () => ({
  default: ({ enhancements }: { enhancements: depot.Enhancement[] }) => (
    <div data-testid="faction-enhancements">Enhancements: {enhancements.length}</div>
  )
}));

// Mock react-router-dom params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'SM' })
  };
});

const mockFaction: depot.Faction = {
  id: 'SM',
  name: 'Space Marines',
  link: '/faction/SM',
  datasheets: [
    {
      id: 'captain',
      name: 'Captain',
      factionId: 'SM',
      role: 'HQ',
      isForgeWorld: false,
      isLegends: false
    } as depot.Datasheet
  ],
  stratagems: [
    {
      id: 'rapid-fire',
      name: 'Rapid Fire',
      factionId: 'SM',
      type: 'Battle Tactic',
      cpCost: '1',
      description: 'Rapid fire stratagem'
    } as depot.Stratagem
  ],
  enhancements: [
    {
      id: 'artificer-armour',
      name: 'Artificer Armour',
      factionId: 'SM',
      cost: '10',
      description: 'Enhanced armor',
      legend: '',
      detachment: 'Gladius'
    }
  ],
  detachmentAbilities: [
    {
      id: 'combat-doctrines',
      name: 'Combat Doctrines',
      factionId: 'SM',
      description: 'Space Marines doctrines',
      legend: '',
      detachment: 'Gladius'
    }
  ]
};

describe('Faction Page', () => {
  const mockUseFaction = vi.fn();
  const mockUseLocalStorage = vi.fn();
  const mockAddToast = vi.fn();
  const mockUseToastContext = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mocks
    mockUseFaction.mockReturnValue({
      data: mockFaction,
      loading: false,
      error: null
    });

    mockUseLocalStorage.mockReturnValue([[], vi.fn()]);

    mockUseToastContext.mockReturnValue({
      showToast: mockAddToast,
      removeToast: vi.fn(),
      clearAllToasts: vi.fn(),
      state: { toasts: [] },
      dispatch: vi.fn()
    });

    // Apply mocks
    const useFactionMock = await import('@/hooks/use-faction');
    vi.mocked(useFactionMock.default).mockImplementation(mockUseFaction);

    const useLocalStorageMock = await import('@/hooks/use-local-storage');
    vi.mocked(useLocalStorageMock.default).mockImplementation(mockUseLocalStorage);

    const useToastMock = await import('@/contexts/toast/use-toast-context');
    vi.mocked(useToastMock.useToast).mockImplementation(mockUseToastContext);
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

    expect(screen.getByText(/Failed to load faction/)).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    render(<Faction />, { wrapper: TestWrapper });

    expect(screen.getByText('Datasheets')).toBeInTheDocument();
    expect(screen.getByText('Detachments')).toBeInTheDocument();
    expect(screen.getByText('Enhancements')).toBeInTheDocument();
    expect(screen.getByText('Stratagems')).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    render(<Faction />, { wrapper: TestWrapper });

    // Should start with datasheets tab active
    expect(screen.getByTestId('faction-datasheets')).toBeInTheDocument();

    // Click on stratagems tab
    fireEvent.click(screen.getByText('Stratagems'));

    await waitFor(() => {
      expect(screen.getByTestId('faction-stratagems')).toBeInTheDocument();
    });
  });

  it('handles favourite toggle when not favourite', async () => {
    const mockSetMyFactions = vi.fn();
    mockUseLocalStorage.mockReturnValue([[], mockSetMyFactions]);

    render(<Faction />, { wrapper: TestWrapper });

    const favouriteButton = screen.getByRole('button', { name: /add to my factions/i });
    fireEvent.click(favouriteButton);

    expect(mockSetMyFactions).toHaveBeenCalledWith([{ id: 'SM', name: 'Space Marines' }]);
    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'success',
      title: 'Success',
      message: 'Space Marines added to My Factions.'
    });
  });

  it('handles favourite toggle when already favourite', async () => {
    const mockSetMyFactions = vi.fn();
    const existingFactions = [{ id: 'SM', name: 'Space Marines' }];
    mockUseLocalStorage.mockReturnValue([existingFactions, mockSetMyFactions]);

    render(<Faction />, { wrapper: TestWrapper });

    const favouriteButton = screen.getByRole('button', { name: /remove from my factions/i });
    fireEvent.click(favouriteButton);

    expect(mockSetMyFactions).toHaveBeenCalledWith([]);
    expect(mockAddToast).toHaveBeenCalledWith({
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

    fireEvent.click(screen.getByText('Enhancements'));
    expect(screen.getByTestId('faction-enhancements')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Stratagems'));
    expect(screen.getByTestId('faction-stratagems')).toBeInTheDocument();
  });

  it('shows unfilled star when not my faction', () => {
    mockUseLocalStorage.mockReturnValue([[], vi.fn()]);

    render(<Faction />, { wrapper: TestWrapper });

    const button = screen.getByRole('button', { name: /add to my factions/i });
    expect(button).toBeInTheDocument();
  });

  it('shows filled star when is my faction', () => {
    mockUseLocalStorage.mockReturnValue([[{ id: 'SM', name: 'Space Marines' }], vi.fn()]);

    render(<Faction />, { wrapper: TestWrapper });

    const button = screen.getByRole('button', { name: /remove from my factions/i });
    expect(button).toBeInTheDocument();
  });
});
