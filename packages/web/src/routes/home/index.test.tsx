import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './index';
import type { depot } from '@depot/core';
import { TestWrapper } from '@/test/test-utils';
import type { AppContextType } from '@/contexts/app/types';

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

// Mock App Context
const mockUseAppContext = vi.fn();
vi.mock('@/contexts/app/use-app-context', () => ({
  useAppContext: () => mockUseAppContext()
}));

const mockFactions: depot.Option[] = [
  { id: 'SM', slug: 'space-marines', name: 'Space Marines' },
  { id: 'CSM', slug: 'chaos-space-marines', name: 'Chaos Space Marines' }
];

describe('Home', () => {
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
    updateMyFactions: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppContext.mockReturnValue(defaultAppContext);
  });

  it('should render welcome section', () => {
    render(<Home />, { wrapper: TestWrapper });

    expect(screen.getByTestId('welcome-heading')).toBeInTheDocument();
  });

  it('should render browse factions card', () => {
    render(<Home />, { wrapper: TestWrapper });

    expect(screen.getByTestId('browse-factions-button')).toBeInTheDocument();
  });

  it('should render settings action', () => {
    render(<Home />, { wrapper: TestWrapper });

    expect(screen.getByTestId('settings-button')).toBeInTheDocument();
    expect(screen.getByText('Adjust settings')).toBeInTheDocument();
  });

  it('should render app info section', () => {
    render(<Home />, { wrapper: TestWrapper });

    expect(screen.getByText(/Data sourced from/)).toBeInTheDocument();
    expect(screen.getByText('Wahapedia')).toBeInTheDocument();
  });

  it('should not render my factions card when no favorites', () => {
    render(<Home />, { wrapper: TestWrapper });

    expect(screen.queryByTestId('quick-access-section')).not.toBeInTheDocument();
  });

  it('should render quick access heading when favorites exist', () => {
    const contextWithMyFactions = {
      ...defaultAppContext,
      state: {
        ...defaultAppContext.state,
        myFactions: mockFactions
      }
    };
    mockUseAppContext.mockReturnValue(contextWithMyFactions);

    render(<Home />, { wrapper: TestWrapper });

    expect(screen.getByTestId('quick-access-section')).toBeInTheDocument();
    expect(screen.getByText('Your factions, one tap away')).toBeInTheDocument();
    expect(screen.getByText('Jump back in')).toBeInTheDocument();
  });

  it('should render quick access section when favorites exist', () => {
    const contextWithMyFactions = {
      ...defaultAppContext,
      state: {
        ...defaultAppContext.state,
        myFactions: mockFactions
      }
    };
    mockUseAppContext.mockReturnValue(contextWithMyFactions);

    render(<Home />, { wrapper: TestWrapper });

    expect(screen.getByTestId('quick-access-section')).toBeInTheDocument();
    const quickAccessSection = screen.getByTestId('quick-access-section');
    expect(screen.getByText('Your factions, one tap away')).toBeInTheDocument();
    expect(quickAccessSection.querySelectorAll('a[href^="/faction/"]')).toHaveLength(2);
  });

  it('should handle singular faction count correctly', () => {
    const contextWithOneFaction = {
      ...defaultAppContext,
      state: {
        ...defaultAppContext.state,
        myFactions: [mockFactions[0]]
      }
    };
    mockUseAppContext.mockReturnValue(contextWithOneFaction);

    render(<Home />, { wrapper: TestWrapper });

    const quickAccessSection = screen.getByTestId('quick-access-section');
    expect(quickAccessSection.querySelectorAll('a[href^="/faction/"]')).toHaveLength(1);
    expect(screen.getByText('Space Marines')).toBeInTheDocument();
  });

  it('should handle empty favorites array', () => {
    const contextWithEmptyFactions = {
      ...defaultAppContext,
      state: {
        ...defaultAppContext.state,
        myFactions: []
      }
    };
    mockUseAppContext.mockReturnValue(contextWithEmptyFactions);

    render(<Home />, { wrapper: TestWrapper });

    expect(screen.queryByTestId('quick-access-section')).not.toBeInTheDocument();
  });

  it('should navigate to factions when browse button is clicked', async () => {
    const user = userEvent.setup();

    render(<Home />, { wrapper: TestWrapper });

    await user.click(screen.getByTestId('browse-factions-button'));
    expect(mockNavigate).toHaveBeenCalledWith('/factions');
  });

  it('should navigate to settings when settings button is clicked', async () => {
    const user = userEvent.setup();

    render(<Home />, { wrapper: TestWrapper });

    await user.click(screen.getByTestId('settings-button'));
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  it('should navigate to faction when quick access faction is clicked', async () => {
    const contextWithMyFactions = {
      ...defaultAppContext,
      state: {
        ...defaultAppContext.state,
        myFactions: mockFactions
      }
    };
    mockUseAppContext.mockReturnValue(contextWithMyFactions);

    render(<Home />, { wrapper: TestWrapper });

    // Find faction links within the quick access section only
    const quickAccessSection = screen.getByTestId('quick-access-section');
    const factionLinks = quickAccessSection.querySelectorAll('a[href^="/faction/"]');
    expect(factionLinks[0]).toHaveAttribute('href', '/faction/space-marines');
    expect(factionLinks[1]).toHaveAttribute('href', '/faction/chaos-space-marines');
  });
});
