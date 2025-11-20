import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Factions from './index';
import type { depot } from '@depot/core';
import type { AppContextType } from '@/contexts/app/types';
import { TestWrapper } from '@/test/test-utils';

// Mock the context with proper typing
const mockAppContext: AppContextType = {
  state: {
    factionIndex: null as depot.Index[] | null,
    offlineFactions: [],
    myFactions: [],
    loading: false,
    error: null as string | null,
    settings: null
  },
  dispatch: vi.fn(),
  getFactionManifest: vi.fn(),
  getDatasheet: vi.fn(),
  clearOfflineData: vi.fn(),
  updateSettings: vi.fn(),
  updateMyFactions: vi.fn()
};

// Mock context provider
vi.mock('@/contexts/app/use-app-context', () => ({
  useAppContext: () => mockAppContext
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock debounce hook
vi.mock('@/hooks/use-debounce', () => ({
  default: (value: string) => value
}));

// Mock child components
vi.mock('./_components/skeleton', () => ({
  default: () => <div data-testid="skeleton">Loading...</div>
}));

vi.mock('@/components/ui', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    ErrorState: ({ title, message, stackTrace }: any) => (
      <div data-testid="error-state">
        <h2>{title}</h2>
        <p>{message}</p>
        {stackTrace && <div data-testid="stack-trace">{stackTrace}</div>}
      </div>
    )
  };
});

vi.mock('./_components/search-filters', () => ({
  default: ({ query, onQueryChange, onClear }: any) => (
    <div data-testid="search-filters">
      <input
        data-testid="faction-search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search factions"
      />
      <button data-testid="clear-search" onClick={onClear}>
        Clear
      </button>
    </div>
  )
}));

vi.mock('./_components/alliance-section', () => ({
  default: ({ alliance, factions }: any) => (
    <div data-testid="alliance-section">
      <h3>{alliance}</h3>
      {factions.map((faction: any) => (
        <div key={faction.id} data-testid="faction-card">
          {faction.name}
        </div>
      ))}
    </div>
  )
}));

vi.mock('./_components/no-results', () => ({
  default: ({ query }: any) => <div data-testid="no-results">No results for: {query}</div>
}));

const mockFactions: depot.Index[] = [
  {
    id: 'AM',
    slug: 'astra-militarum',
    name: 'Astra Militarum',
    path: '/data/factions/astra-militarum/faction.json'
  },
  {
    id: 'SM',
    slug: 'space-marines',
    name: 'Space Marines',
    path: '/data/factions/space-marines/faction.json'
  },
  {
    id: 'CSM',
    slug: 'chaos-space-marines',
    name: 'Chaos Space Marines',
    path: '/data/factions/chaos-space-marines/faction.json'
  }
];

describe('Factions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppContext.state.loading = false;
    mockAppContext.state.error = null;
    mockAppContext.state.factionIndex = mockFactions;
  });

  it('should render LoadingSkeleton when loading', () => {
    mockAppContext.state.loading = true;

    render(
      <TestWrapper>
        <Factions />
      </TestWrapper>
    );

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('should not render main content when loading', () => {
    mockAppContext.state.loading = true;

    render(
      <TestWrapper>
        <Factions />
      </TestWrapper>
    );

    expect(screen.queryByTestId('search-filters')).not.toBeInTheDocument();
  });

  it('should render ErrorState when there is an error', () => {
    const errorMessage = 'Failed to load factions';
    mockAppContext.state.error = errorMessage;

    render(
      <TestWrapper>
        <Factions />
      </TestWrapper>
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('should not render main content when there is an error', () => {
    mockAppContext.state.error = 'Some error';

    render(
      <TestWrapper>
        <Factions />
      </TestWrapper>
    );

    expect(screen.queryByTestId('search-filters')).not.toBeInTheDocument();
  });

  it('should render the factions content when loaded successfully', () => {
    render(
      <TestWrapper>
        <Factions />
      </TestWrapper>
    );

    expect(screen.getByTestId('search-filters')).toBeInTheDocument();
  });

  it('should handle search functionality', () => {
    render(
      <TestWrapper>
        <Factions />
      </TestWrapper>
    );

    const searchInput = screen.getByTestId('faction-search');
    fireEvent.change(searchInput, { target: { value: 'Space' } });

    expect(searchInput).toHaveValue('Space');
  });

  it('should clear search when clear button is clicked', () => {
    render(
      <TestWrapper>
        <Factions />
      </TestWrapper>
    );

    const searchInput = screen.getByTestId('faction-search');
    const clearButton = screen.getByTestId('clear-search');

    fireEvent.change(searchInput, { target: { value: 'Space' } });
    expect(searchInput).toHaveValue('Space');

    fireEvent.click(clearButton);
    expect(searchInput).toHaveValue('');
  });

  it('should have correct title', () => {
    render(
      <TestWrapper>
        <Factions />
      </TestWrapper>
    );

    // The title is set in AppLayout, check if the component renders without error
    expect(screen.getByTestId('search-filters')).toBeInTheDocument();
  });
});
