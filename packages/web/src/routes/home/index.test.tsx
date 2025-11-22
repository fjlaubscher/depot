import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './index';
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

describe('Home', () => {
  const defaultAppContext: AppContextType = {
    state: {
      factionIndex: null,
      offlineFactions: [],
      loading: false,
      error: null,
      settings: null
    },
    dispatch: vi.fn(),
    getFactionManifest: vi.fn(),
    getDatasheet: vi.fn(),
    clearOfflineData: vi.fn(),
    updateSettings: vi.fn()
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
    expect(screen.getByText(/Toggle data refreshes/i)).toBeInTheDocument();
  });

  it('should render collections action and navigate', async () => {
    const user = userEvent.setup();

    render(<Home />, { wrapper: TestWrapper });

    expect(screen.getByTestId('collections-button')).toBeInTheDocument();
    await user.click(screen.getByTestId('collections-button'));
    expect(mockNavigate).toHaveBeenCalledWith('/collections');
  });

  it('should render app info section', () => {
    render(<Home />, { wrapper: TestWrapper });

    expect(screen.getByText(/Data sourced from/)).toBeInTheDocument();
    expect(screen.getByText('Wahapedia')).toBeInTheDocument();
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
});
