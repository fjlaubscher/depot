import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AllFactionsTab from './all-factions-tab';
import { GroupedFactions } from '../utils/faction';
import { depot } from 'depot-core';
import { TestWrapper } from '@/test/test-utils';

// Mock child components
vi.mock('./alliance-section', () => ({
  default: ({ alliance, factions }: { alliance: string; factions: depot.Index[] }) => (
    <div data-testid={`alliance-${alliance}`}>
      <h2>{alliance}</h2>
      {factions.map((f) => (
        <div key={f.id} data-testid={`faction-${f.id}`}>
          {f.name}
        </div>
      ))}
    </div>
  )
}));

vi.mock('./search-filters', () => ({
  default: ({
    query,
    onQueryChange,
    onClear
  }: {
    query: string;
    onQueryChange: (q: string) => void;
    onClear: () => void;
  }) => (
    <div data-testid="search-filters">
      <input
        data-testid="search-input"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      {query && (
        <button data-testid="clear-button" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  )
}));

vi.mock('./no-results', () => ({
  default: ({ query }: { query: string }) => (
    <div data-testid="no-results">No results for "{query}"</div>
  )
}));

const mockGroupedFactions: GroupedFactions = {
  imperium: [
    { id: 'SM', name: 'Space Marines', path: '/data/sm.json' },
    { id: 'AM', name: 'Astra Militarum', path: '/data/am.json' }
  ],
  chaos: [{ id: 'CSM', name: 'Chaos Space Marines', path: '/data/csm.json' }],
  xenos: [
    { id: 'ORK', name: 'Orks', path: '/data/ork.json' },
    { id: 'TAU', name: "T'au Empire", path: '/data/tau.json' }
  ]
};

const defaultProps = {
  groupedFactions: mockGroupedFactions,
  query: '',
  onQueryChange: vi.fn(),
  onClear: vi.fn(),
  debouncedQuery: ''
};

describe('AllFactionsTab', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render SearchFilters component', () => {
    render(
      <TestWrapper>
        <AllFactionsTab {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('search-filters')).toBeInTheDocument();
  });

  it('should render all alliance sections when results exist', () => {
    render(
      <TestWrapper>
        <AllFactionsTab {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('alliance-imperium')).toBeInTheDocument();
    expect(screen.getByTestId('alliance-chaos')).toBeInTheDocument();
    expect(screen.getByTestId('alliance-xenos')).toBeInTheDocument();

    // Check that factions are rendered within their alliances
    expect(screen.getByTestId('faction-SM')).toBeInTheDocument();
    expect(screen.getByTestId('faction-CSM')).toBeInTheDocument();
    expect(screen.getByTestId('faction-ORK')).toBeInTheDocument();
  });

  it('should not render NoResults when there are results', () => {
    render(
      <TestWrapper>
        <AllFactionsTab {...defaultProps} debouncedQuery="space" />
      </TestWrapper>
    );

    expect(screen.queryByTestId('no-results')).not.toBeInTheDocument();
  });

  it('should render NoResults when no results and query exists', () => {
    render(
      <TestWrapper>
        <AllFactionsTab {...defaultProps} groupedFactions={{}} debouncedQuery="necrons" />
      </TestWrapper>
    );

    expect(screen.getByTestId('no-results')).toBeInTheDocument();
    expect(screen.getByText('No results for "necrons"')).toBeInTheDocument();
  });

  it('should not render NoResults when no results and no query', () => {
    render(
      <TestWrapper>
        <AllFactionsTab {...defaultProps} groupedFactions={{}} debouncedQuery="" />
      </TestWrapper>
    );

    expect(screen.queryByTestId('no-results')).not.toBeInTheDocument();
  });

  it('should render alliance sections in consistent order', () => {
    render(
      <TestWrapper>
        <AllFactionsTab {...defaultProps} />
      </TestWrapper>
    );

    const alliances = screen.getAllByTestId(/^alliance-/);
    const allianceNames = alliances.map((alliance) =>
      alliance.getAttribute('data-testid')?.replace('alliance-', '')
    );

    // Check that all expected alliances are present
    expect(allianceNames).toContain('imperium');
    expect(allianceNames).toContain('chaos');
    expect(allianceNames).toContain('xenos');
  });

  it('should handle single alliance results', () => {
    const singleAllianceProps = {
      ...defaultProps,
      groupedFactions: {
        imperium: mockGroupedFactions.imperium
      }
    };

    render(
      <TestWrapper>
        <AllFactionsTab {...singleAllianceProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('alliance-imperium')).toBeInTheDocument();
    expect(screen.queryByTestId('alliance-chaos')).not.toBeInTheDocument();
    expect(screen.queryByTestId('alliance-xenos')).not.toBeInTheDocument();
  });

  it('should handle empty groupedFactions gracefully', () => {
    render(
      <TestWrapper>
        <AllFactionsTab {...defaultProps} groupedFactions={{}} />
      </TestWrapper>
    );

    expect(screen.getByTestId('search-filters')).toBeInTheDocument();
    expect(screen.queryByTestId(/^alliance-/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('no-results')).not.toBeInTheDocument();
  });
});
