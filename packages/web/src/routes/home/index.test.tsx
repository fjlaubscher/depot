import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { depot } from '@depot/core';

import { TestWrapper } from '@/test/test-utils';
import { mockRoster, createMockRoster } from '@/test/mock-data';
import Home from './index';

vi.mock('@/components/layout', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="app-layout" data-title={title}>
      {children}
    </div>
  )
}));

const mockFactionsContext = vi.hoisted(() => ({
  factionIndex: [] as depot.Index[],
  loading: false,
  error: null as string | null,
  dataVersion: '2024.10.01' as string | null
}));

vi.mock('@/contexts/factions/context', async () => {
  const actual = await vi.importActual('@/contexts/factions/context');
  return {
    ...(actual as object),
    useFactionsContext: () => mockFactionsContext
  };
});

const mockUseRosters = vi.hoisted(() => ({
  rosters: [] as depot.Roster[],
  loading: false,
  error: null as string | null,
  addRoster: vi.fn(),
  updateRoster: vi.fn(),
  deleteRoster: vi.fn(),
  getRoster: vi.fn(),
  duplicateRoster: vi.fn(),
  refresh: vi.fn()
}));

vi.mock('@/hooks/use-rosters', () => ({
  default: () => mockUseRosters
}));

const mockUseCollections = vi.hoisted(() => ({
  collections: [] as depot.Collection[],
  loading: false,
  error: null as string | null,
  refresh: vi.fn()
}));

vi.mock('@/hooks/use-collections', () => ({
  default: () => mockUseCollections,
  useCollections: () => mockUseCollections
}));

const mockUseBookmarks = vi.hoisted(() => ({
  bookmarks: [] as depot.Bookmark[],
  loading: false,
  error: null as string | null,
  refresh: vi.fn(),
  isBookmarked: vi.fn(() => false),
  addBookmark: vi.fn(),
  removeBookmark: vi.fn(),
  toggleBookmark: vi.fn()
}));

vi.mock('@/hooks/use-bookmarks', () => ({
  default: () => mockUseBookmarks
}));

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRosters.rosters = [];
    mockUseRosters.loading = false;
    mockUseCollections.collections = [];
    mockUseCollections.loading = false;
    mockUseBookmarks.bookmarks = [];
    mockUseBookmarks.loading = false;
    mockFactionsContext.dataVersion = '2024.10.01';
  });

  it('renders hero, get-started and footer when there is no local data', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByTestId('home-hero')).toHaveTextContent('11th edition is here');
    expect(screen.getByTestId('get-started')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Create roster/ })).toHaveAttribute('href', '/rosters');
    expect(screen.getByRole('link', { name: /Create collection/ })).toHaveAttribute(
      'href',
      '/collections'
    );
    expect(screen.queryByTestId('bookmarks-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('rosters-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('collections-section')).not.toBeInTheDocument();
    expect(screen.getByText(/Last updated: 2024.10.01/i)).toBeInTheDocument();
  });

  it('previews bookmarks and recent rosters when present', () => {
    mockUseBookmarks.bookmarks = [
      {
        id: 'faction:space-marines',
        kind: 'faction',
        factionSlug: 'space-marines',
        name: 'Space Marines',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ];
    mockUseRosters.rosters = [
      createMockRoster({
        id: 'old',
        name: 'Older List',
        updatedAt: '2020-01-01T00:00:00.000Z'
      }),
      createMockRoster({
        ...mockRoster,
        id: 'new',
        name: 'Newest List',
        updatedAt: '2025-01-01T00:00:00.000Z'
      })
    ];

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(screen.queryByTestId('get-started')).not.toBeInTheDocument();
    expect(screen.getByTestId('bookmark-previews')).toBeInTheDocument();
    expect(screen.getByTestId('bookmark-card')).toHaveTextContent('Space Marines');
    expect(screen.getByText('Bookmarks')).toBeInTheDocument();
    expect(screen.getByTestId('roster-previews')).toBeInTheDocument();
    const rosterCards = screen.getAllByTestId('roster-preview-card');
    expect(rosterCards).toHaveLength(2);
    expect(rosterCards[0]).toHaveTextContent('Newest List');
    expect(screen.getByTestId('view-all-rosters')).toBeInTheDocument();
    expect(screen.queryByTestId('collections-section')).not.toBeInTheDocument();
  });
});
