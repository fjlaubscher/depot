import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomeNew from './index';
import { depot } from 'depot-core';
import { AppContextType } from '@/contexts/app/types';
import { TestWrapper } from '@/test/test-utils';

// Mock the context with proper typing
const mockAppContext: AppContextType = {
  state: {
    factionIndex: null as depot.Index[] | null,
    factionCache: {},
    loading: false,
    error: null as string | null,
    settings: null
  },
  dispatch: vi.fn(),
  loadFaction: vi.fn()
};

vi.mock('@/contexts/app/use-app-context', () => ({
  useAppContext: () => mockAppContext
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

// Mock localStorage hook
const mockLocalStorage = vi.fn().mockReturnValue([undefined, vi.fn()]);
vi.mock('@/hooks/use-local-storage', () => ({
  default: () => mockLocalStorage()
}));

// Mock debounce hook
vi.mock('@/hooks/use-debounce', () => ({
  default: (value: string) => value
}));

// Mock child components
vi.mock('./components/loading-skeleton', () => ({
  default: () => <div data-testid="loading-skeleton">Loading...</div>
}));

vi.mock('./components/error-state', () => ({
  default: ({ error }: { error: string }) => <div data-testid="error-state">Error: {error}</div>
}));

vi.mock('./components/favourites-tab', () => ({
  default: ({ favourites }: { favourites: depot.Index[] }) => (
    <div data-testid="favourites-tab">
      {favourites.map((f) => (
        <div key={f.id}>{f.name}</div>
      ))}
    </div>
  )
}));

vi.mock('./components/all-factions-tab', () => ({
  default: ({ query, onQueryChange }: { query: string; onQueryChange: (q: string) => void }) => (
    <div data-testid="all-factions-tab">
      <input
        data-testid="search-input"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
    </div>
  )
}));

const mockFactions: depot.Index[] = [
  { id: 'SM', name: 'Space Marines', path: '/data/sm.json' },
  { id: 'CSM', name: 'Chaos Space Marines', path: '/data/csm.json' }
];


describe('HomeNew', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.mockReturnValue([undefined, vi.fn()]);
  });

  describe('Loading State', () => {
    it('should render LoadingSkeleton when loading', () => {
      mockAppContext.state.loading = true;

      render(
        <TestWrapper>
          <HomeNew />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not render main content when loading', () => {
      mockAppContext.state.loading = true;

      render(
        <TestWrapper>
          <HomeNew />
        </TestWrapper>
      );

      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
      expect(screen.queryByTestId('all-factions-tab')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    beforeEach(() => {
      mockAppContext.state.loading = false;
      mockAppContext.state.error = 'Failed to load factions';
    });

    it('should render ErrorState when there is an error', () => {
      render(
        <TestWrapper>
          <HomeNew />
        </TestWrapper>
      );

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Error: Failed to load factions')).toBeInTheDocument();
    });

    it('should not render main content when there is an error', () => {
      render(
        <TestWrapper>
          <HomeNew />
        </TestWrapper>
      );

      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
      expect(screen.queryByTestId('all-factions-tab')).not.toBeInTheDocument();
    });
  });

  describe('Success State - No Favourites', () => {
    beforeEach(() => {
      mockAppContext.state.loading = false;
      mockAppContext.state.error = null;
      mockAppContext.state.factionIndex = mockFactions;
      mockLocalStorage.mockReturnValue([undefined, vi.fn()]);
    });

    it('should render only All Factions tab when no favourites', () => {
      render(
        <TestWrapper>
          <HomeNew />
        </TestWrapper>
      );

      expect(screen.getByText('All Factions')).toBeInTheDocument();
      expect(screen.queryByText('Favourites')).not.toBeInTheDocument();
    });

    it('should render AllFactionsTab', () => {
      render(
        <TestWrapper>
          <HomeNew />
        </TestWrapper>
      );

      expect(screen.getByTestId('all-factions-tab')).toBeInTheDocument();
    });

    it('should render settings button', () => {
      render(
        <TestWrapper>
          <HomeNew />
        </TestWrapper>
      );

      const settingsButton = screen.getByLabelText('Open settings');
      expect(settingsButton).toBeInTheDocument();
    });
  });

  describe('Success State - With Favourites', () => {
    beforeEach(() => {
      mockAppContext.state.loading = false;
      mockAppContext.state.error = null;
      mockAppContext.state.factionIndex = mockFactions;
      mockLocalStorage.mockReturnValue([[mockFactions[0]], vi.fn()]);
    });

    it('should render both Favourites and All Factions tabs when favourites exist', () => {
      render(
        <TestWrapper>
          <HomeNew />
        </TestWrapper>
      );

      expect(screen.getByText('Favourites')).toBeInTheDocument();
      expect(screen.getByText('All Factions')).toBeInTheDocument();
    });

    it('should render FavouritesTab when favourites exist', () => {
      render(
        <TestWrapper>
          <HomeNew />
        </TestWrapper>
      );

      expect(screen.getByTestId('favourites-tab')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      mockAppContext.state.loading = false;
      mockAppContext.state.error = null;
      mockAppContext.state.factionIndex = mockFactions;
      mockLocalStorage.mockReturnValue([undefined, vi.fn()]);
    });

    it('should navigate to settings when settings button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <HomeNew />
        </TestWrapper>
      );

      const settingsButton = screen.getByLabelText('Open settings');
      await user.click(settingsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });

    it('should handle search query changes', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <HomeNew />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'space');

      // The component should have the search input with the typed value
      expect(searchInput).toHaveValue('space');
    });

    it('should handle empty favourites array gracefully', () => {
      mockLocalStorage.mockReturnValue([[], vi.fn()]);

      render(
        <TestWrapper>
          <HomeNew />
        </TestWrapper>
      );

      expect(screen.queryByText('Favourites')).not.toBeInTheDocument();
      expect(screen.getByText('All Factions')).toBeInTheDocument();
    });

    it('should handle null favourites gracefully', () => {
      mockLocalStorage.mockReturnValue([null, vi.fn()]);

      render(
        <TestWrapper>
          <HomeNew />
        </TestWrapper>
      );

      expect(screen.queryByText('Favourites')).not.toBeInTheDocument();
      expect(screen.getByText('All Factions')).toBeInTheDocument();
    });
  });

  describe('Tab Management', () => {
    it('should maintain tab state when switching between tabs', async () => {
      const user = userEvent.setup();
      mockLocalStorage.mockReturnValue([[mockFactions[0]], vi.fn()]);

      render(
        <TestWrapper>
          <HomeNew />
        </TestWrapper>
      );

      // Should start with Favourites tab (index 0)
      expect(screen.getByTestId('favourites-tab')).toBeInTheDocument();

      // Click on All Factions tab
      const allFactionsTab = screen.getByText('All Factions');
      await user.click(allFactionsTab);

      // Should now show All Factions content
      await waitFor(() => {
        expect(screen.getByTestId('all-factions-tab')).toBeInTheDocument();
      });
    });
  });
});
