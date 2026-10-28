import type { ReactNode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import i18n from '@/i18n';
import type { Action } from '@/components/ui/action-group';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { depot } from '@depot/core';

import RosterPage from './index';
import { TestWrapper } from '@/test/test-utils';
import { createMockRoster, mockFactionIndex } from '@/test/mock-data';

vi.mock('@/components/layout', () => ({
  default: ({
    children,
    heading,
    actions
  }: {
    children: ReactNode;
    heading?: { title: string; subtitle?: string; meta?: ReactNode };
    actions?: Action[];
  }) => (
    <div data-testid="app-layout">
      {heading?.title ? <h1>{heading.title}</h1> : null}
      {heading?.meta}
      {actions?.map((action, index) => (
        <button key={index} aria-label={action.ariaLabel} onClick={() => action.onClick()}>
          {action.ariaLabel}
        </button>
      ))}
      {children}
    </div>
  )
}));

vi.mock('./_components/units-tab', () => ({ default: () => <div data-testid="units-tab" /> }));
vi.mock('./_components/detachment-overview', () => ({
  default: () => <div data-testid="detachment-tab" />
}));
vi.mock('./_components/stratagems-tab', () => ({
  default: () => <div data-testid="stratagems-tab" />
}));
vi.mock('@/routes/rosters/_components/roster-issues', () => ({ default: () => null }));
vi.mock('@/components/shared', async () => {
  const actual = await vi.importActual<typeof import('@/components/shared')>('@/components/shared');
  return { ...actual, RosterHeader: () => <div data-testid="roster-header" /> };
});

vi.mock('@/hooks/use-core-stratagems', () => ({
  default: () => ({ stratagems: [], loading: false, error: null })
}));

const mockUseRoster = vi.hoisted(() => ({
  state: { id: 'test-roster-1', name: 'Test Space Marines Roster' } as depot.Roster,
  setRoster: vi.fn()
}));

vi.mock('@/contexts/roster/context', async () => {
  const actual = await vi.importActual<typeof import('@/contexts/roster/context')>(
    '@/contexts/roster/context'
  );
  return {
    ...actual,
    useRoster: () => mockUseRoster
  };
});

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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ rosterId: 'test-roster-1' })
  };
});

const linkedCollection: depot.Collection = {
  id: 'collection-1',
  name: 'My Marines',
  factionId: 'SM',
  factionSlug: 'space-marines',
  faction: mockFactionIndex,
  items: [],
  points: { current: 0 }
};

describe('RosterPage', () => {
  it('shares in the language selected after the page was mounted', async () => {
    mockUseRoster.state = createMockRoster({ warlordUnitId: createMockRoster().units[0].id });
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      clipboard: { writeText },
      languages: ['en'],
      onLine: true,
      userAgent: navigator.userAgent
    });
    render(<RosterPage />, { wrapper: TestWrapper });
    await act(() => i18n.changeLanguage('fr'));
    fireEvent.click(screen.getByRole('button', { name: 'Copier le texte de partage de la liste' }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining('[Seigneur de guerre] Captain')
      )
    );
    vi.unstubAllGlobals();
  });
  beforeEach(() => {
    mockUseRoster.state = createMockRoster();
    mockUseCollections.collections = [];
  });

  it('links to the attached collection when collectionId is set', () => {
    mockUseRoster.state = createMockRoster({ collectionId: 'collection-1' });
    mockUseCollections.collections = [linkedCollection];

    render(
      <TestWrapper>
        <RosterPage />
      </TestWrapper>
    );

    const link = screen.getByTestId('roster-collection-link');
    expect(link).toHaveTextContent('Collection · My Marines');
    expect(link).toHaveAttribute('href', '/collections/collection-1');
  });

  it('omits the collection link when collectionId is null', () => {
    mockUseRoster.state = createMockRoster({ collectionId: null });

    render(
      <TestWrapper>
        <RosterPage />
      </TestWrapper>
    );

    expect(screen.queryByTestId('roster-collection-link')).not.toBeInTheDocument();
  });

  it('omits the collection link when the attached collection was deleted', () => {
    mockUseRoster.state = createMockRoster({ collectionId: 'missing-collection' });
    mockUseCollections.collections = [linkedCollection];

    render(
      <TestWrapper>
        <RosterPage />
      </TestWrapper>
    );

    expect(screen.queryByTestId('roster-collection-link')).not.toBeInTheDocument();
  });
});
