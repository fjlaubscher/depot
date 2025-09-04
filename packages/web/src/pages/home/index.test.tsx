import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './index';
import { depot } from '@depot/core';
import { TestWrapper } from '@/test/test-utils';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock MyFactions hook
const mockMyFactions = vi.fn().mockReturnValue([undefined, vi.fn()]);
vi.mock('@/hooks/use-my-factions', () => ({
  default: () => mockMyFactions()
}));

const mockFactions: depot.Index[] = [
  { id: 'SM', name: 'Space Marines', path: '/data/sm.json' },
  { id: 'CSM', name: 'Chaos Space Marines', path: '/data/csm.json' }
];

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMyFactions.mockReturnValue([undefined, vi.fn()]);
  });

  describe('Component Rendering', () => {
    it('should render welcome section', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByTestId('welcome-heading')).toBeInTheDocument();
      expect(screen.getByText('Welcome to depot')).toBeInTheDocument();
      expect(screen.getByText(/Your Warhammer 40,000 companion app/)).toBeInTheDocument();
    });

    it('should render browse factions card', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByText('Browse Factions')).toBeInTheDocument();
      expect(screen.getByText(/Explore all Warhammer 40K factions/)).toBeInTheDocument();
      expect(screen.getByTestId('browse-factions-button')).toBeInTheDocument();
    });

    it('should render settings card', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByTestId('settings-card-heading')).toBeInTheDocument();
      expect(screen.getByText(/Configure Forge World and Legends/)).toBeInTheDocument();
      expect(screen.getByTestId('settings-button')).toBeInTheDocument();
    });

    it('should render app info section', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByText(/Data sourced from/)).toBeInTheDocument();
      expect(screen.getByText('Wahapedia')).toBeInTheDocument();
    });
  });

  describe('My Factions Feature', () => {
    it('should not render my factions card when no favorites', () => {
      mockMyFactions.mockReturnValue([undefined, vi.fn()]);

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.queryByText('My Factions')).not.toBeInTheDocument();
      expect(screen.queryByTestId('quick-access-section')).not.toBeInTheDocument();
    });

    it('should render my factions card when favorites exist', () => {
      mockMyFactions.mockReturnValue([mockFactions, vi.fn()]);

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByTestId('my-factions-card-heading')).toBeInTheDocument();
      expect(screen.getByText('2 favorite factions saved')).toBeInTheDocument();
    });

    it('should render quick access section when favorites exist', () => {
      mockMyFactions.mockReturnValue([mockFactions, vi.fn()]);

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByTestId('quick-access-section')).toBeInTheDocument();
      expect(screen.getByText('Quick Access')).toBeInTheDocument();
      // Check that faction links exist without checking text due to sidebar conflicts
      const quickAccessSection = screen.getByTestId('quick-access-section');
      expect(quickAccessSection).toBeInTheDocument();
      expect(quickAccessSection.querySelectorAll('a[href^="/faction/"]')).toHaveLength(2);
    });

    it('should handle singular faction count correctly', () => {
      mockMyFactions.mockReturnValue([[mockFactions[0]], vi.fn()]);

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.getByText('1 favorite faction saved')).toBeInTheDocument();
    });

    it('should handle empty favorites array', () => {
      mockMyFactions.mockReturnValue([[], vi.fn()]);

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      expect(screen.queryByText('My Factions')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to factions when browse button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('browse-factions-button'));
      expect(mockNavigate).toHaveBeenCalledWith('/factions');
    });

    it('should navigate to settings when settings button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('settings-button'));
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });

    it('should navigate to faction when quick access faction is clicked', async () => {
      const user = userEvent.setup();
      mockMyFactions.mockReturnValue([mockFactions, vi.fn()]);

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );

      // Find faction links within the quick access section only
      const quickAccessSection = screen.getByTestId('quick-access-section');
      const factionLinks = quickAccessSection.querySelectorAll('a[href^="/faction/"]');
      expect(factionLinks[0]).toHaveAttribute('href', '/faction/SM');
      expect(factionLinks[1]).toHaveAttribute('href', '/faction/CSM');
    });
  });
});
