import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { depot } from '@depot/core';

import ListsPanel from './lists-panel';
import { TestWrapper } from '@/test/test-utils';
import { createMockRoster } from '@/test/mock-data';

vi.mock('./create-roster-sheet', () => ({
  default: () => null
}));

const mockUseRosters = vi.hoisted(() => ({
  rosters: [] as depot.Roster[],
  loading: false,
  error: null as string | null,
  deleteRoster: vi.fn(),
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

describe('ListsPanel', () => {
  beforeEach(() => {
    mockUseRosters.rosters = [];
    mockUseRosters.loading = false;
    mockUseRosters.error = null;
    mockUseCollections.collections = [];
  });

  it('shows a rosters empty state', () => {
    render(
      <TestWrapper>
        <ListsPanel />
      </TestWrapper>
    );

    expect(screen.getByTestId('empty-rosters')).toHaveTextContent('No rosters yet');
    expect(screen.queryByText('No lists yet')).not.toBeInTheDocument();
  });

  it('includes the collection name on a linked roster card', () => {
    mockUseRosters.rosters = [createMockRoster({ collectionId: 'collection-1' })];
    mockUseCollections.collections = [
      {
        id: 'collection-1',
        name: 'My Marines',
        factionId: 'SM',
        items: [],
        points: { current: 0 }
      }
    ];

    render(
      <TestWrapper>
        <ListsPanel />
      </TestWrapper>
    );

    expect(screen.getByTestId('roster-card')).toHaveTextContent('My Marines');
  });
});
