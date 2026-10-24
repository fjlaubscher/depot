import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import type { depot } from '@depot/core';

import { TestWrapper } from '@/test/test-utils';
import { mockRoster, createMockRoster } from '@/test/mock-data';
import Home from './index';
import i18n from '@/i18n';

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
  afterEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

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

  it('renders the hero and footer when there is no local data', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByTestId('home-hero')).toHaveTextContent('depot has a new look');
    expect(screen.queryByTestId('bookmarks-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('rosters-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('collections-section')).not.toBeInTheDocument();
    expect(screen.getByTestId('data-version')).toHaveTextContent('Wahapedia data · 2024.10.01');
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

  it('updates the bookmarks label when the configured language changes', async () => {
    mockUseBookmarks.bookmarks = [
      {
        id: 'faction:space-marines',
        kind: 'faction',
        factionSlug: 'space-marines',
        name: 'Space Marines',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    render(<Home />, { wrapper: TestWrapper });
    expect(screen.getByTestId('bookmarks-section')).toHaveTextContent('Bookmarks');

    await act(async () => {
      await i18n.changeLanguage('fr');
    });

    expect(screen.getByTestId('bookmarks-section')).toHaveTextContent('Favoris');
    expect(screen.getByTestId('bookmark-card')).toHaveTextContent('Space Marines');
  });

  it('translates the hero, document title, cards and counts when language changes', async () => {
    mockUseBookmarks.bookmarks = [
      {
        id: 'faction:test',
        kind: 'faction',
        factionSlug: 'test',
        name: 'My Faction',
        createdAt: ''
      }
    ];
    mockUseRosters.rosters = [
      createMockRoster({ name: 'My List', points: { current: 1234, max: 2000 } })
    ];
    mockUseCollections.collections = [
      {
        id: 'my-collection',
        name: 'My Collection',
        factionId: 'test',
        points: { current: 0 },
        items: [],
        createdAt: '',
        updatedAt: ''
      }
    ];
    const view = render(<Home />, { wrapper: TestWrapper });
    expect(screen.getByTestId('app-layout')).toHaveAttribute(
      'data-title',
      'depot - Offline Warhammer 40,000 Companion'
    );
    expect(screen.getByLabelText('1 bookmark')).toHaveTextContent('1');
    expect(screen.getByRole('region', { name: '1 bookmark' })).toBeInTheDocument();
    expect(screen.getByTestId('roster-preview-card')).toHaveTextContent('1,234/2,000');
    expect(screen.getByTestId('collection-preview-card')).toHaveTextContent('READY · 0 PTS');

    await act(async () => {
      await i18n.changeLanguage('fr');
    });
    expect(screen.getByTestId('app-layout')).toHaveAttribute(
      'data-title',
      'depot - Compagnon Warhammer 40,000 hors ligne'
    );
    expect(screen.getByTestId('home-hero')).toHaveTextContent('depot fait peau neuve');
    expect(screen.getByTestId('home-hero')).toHaveTextContent('11e édition');
    expect(screen.getByTestId('rosters-section')).toHaveTextContent('Listes récentes');
    expect(screen.getByTestId('bookmark-card')).toHaveTextContent('My FactionFACTION');
    expect(screen.getByLabelText('1 favori')).toHaveTextContent('1');
    expect(screen.getByRole('region', { name: '1 favori' })).toBeInTheDocument();
    expect(screen.getByTestId('roster-preview-card')).toHaveTextContent('My List');
    expect(screen.getByTestId('roster-preview-card').textContent).toContain('1 234/2 000');
    expect(screen.getByTestId('roster-preview-card')).toHaveTextContent('INVALIDE');
    expect(screen.getByTestId('collection-preview-card')).toHaveTextContent('My Collection');
    expect(screen.getByTestId('collection-preview-card')).toHaveTextContent('PRÊTE · 0 PTS');

    mockUseBookmarks.bookmarks = [
      ...mockUseBookmarks.bookmarks,
      { ...mockUseBookmarks.bookmarks[0], id: 'faction:second' }
    ];
    view.rerender(<Home />);
    expect(screen.getByLabelText('2 favoris')).toHaveTextContent('2');
  });

  it('uses the translated loading label', async () => {
    mockUseRosters.loading = true;
    render(<Home />, { wrapper: TestWrapper });
    expect(screen.getByRole('status')).toHaveAccessibleName('Loading…');
    await act(async () => {
      await i18n.changeLanguage('fr');
    });
    expect(screen.getByRole('status')).toHaveAccessibleName('Chargement…');
  });
});
