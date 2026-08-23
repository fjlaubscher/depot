import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { depot } from '@depot/core';

import { TestWrapper } from '@/test/test-utils';
import CollectionsPage from './index';

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

vi.mock('@/components/layout/install-banner', () => ({
  default: () => null
}));

describe('CollectionsPage', () => {
  beforeEach(() => {
    mockUseCollections.collections = [];
    mockUseCollections.loading = false;
    mockUseCollections.error = null;
  });

  it('shows Import and New on the heading row', () => {
    render(
      <TestWrapper>
        <CollectionsPage />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'Collections' })).toBeInTheDocument();
    expect(screen.getByTestId('import-collection-button')).toBeInTheDocument();
    expect(screen.getByTestId('create-collection-button')).toBeInTheDocument();
    expect(screen.getByTestId('empty-collections')).toBeInTheDocument();
  });
});
