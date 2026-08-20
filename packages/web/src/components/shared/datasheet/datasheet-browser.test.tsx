import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DatasheetBrowser } from './datasheet-browser';
import { TestWrapper } from '@/test/test-utils';
import { createMockDatasheet } from '@/test/mock-data';

describe('DatasheetBrowser', () => {
  const datasheets = [
    createMockDatasheet({ id: 'captain', slug: 'captain', name: 'Captain' }),
    createMockDatasheet({ id: 'intercessor', slug: 'intercessor-squad', name: 'Intercessor Squad' })
  ];

  it('searches datasheets without role tabs', async () => {
    render(
      <TestWrapper>
        <DatasheetBrowser datasheets={datasheets} />
      </TestWrapper>
    );

    expect(screen.queryByRole('tablist', { name: 'Datasheet roles' })).not.toBeInTheDocument();
    expect(screen.getByText('Captain')).toBeInTheDocument();
    expect(screen.getByText('Intercessor Squad')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('datasheet-search'), { target: { value: 'intercessor' } });

    await waitFor(() => {
      expect(screen.getByText('Intercessor Squad')).toBeInTheDocument();
      expect(screen.queryByText('Captain')).not.toBeInTheDocument();
    });
  });
});
