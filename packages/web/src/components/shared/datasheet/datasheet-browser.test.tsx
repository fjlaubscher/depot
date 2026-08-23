import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DatasheetBrowser } from './datasheet-browser';
import { TestWrapper } from '@/test/test-utils';
import { createMockDatasheet } from '@/test/mock-data';

const infantryOnly = [
  {
    datasheetId: 'x',
    keyword: 'INFANTRY',
    model: '',
    isFactionKeyword: 'false' as const
  }
];

const keyword = (value: string) => [
  {
    datasheetId: 'x',
    keyword: value,
    model: '',
    isFactionKeyword: 'false' as const
  }
];

describe('DatasheetBrowser', () => {
  const datasheets = [
    createMockDatasheet({
      id: 'captain',
      slug: 'captain',
      name: 'Captain',
      keywords: infantryOnly
    }),
    createMockDatasheet({
      id: 'intercessor',
      slug: 'intercessor-squad',
      name: 'Intercessor Squad',
      keywords: infantryOnly
    })
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
    expect(document.getElementById('datasheet-results')).toHaveClass('grid');
    expect(screen.getAllByTestId('link-card').length).toBe(2);

    fireEvent.change(screen.getByTestId('datasheet-search'), { target: { value: 'intercessor' } });

    await waitFor(() => {
      expect(screen.getByText('Intercessor Squad')).toBeInTheDocument();
      expect(screen.queryByText('Captain')).not.toBeInTheDocument();
    });
  });

  it('applies resultsClassName to the datasheet grid', () => {
    render(
      <TestWrapper>
        <DatasheetBrowser datasheets={datasheets} resultsClassName="pb-28 md:pb-24" />
      </TestWrapper>
    );

    const results = document.getElementById('datasheet-results');
    expect(results).toHaveClass('pb-28', 'md:pb-24', 'grid');
    expect(results).toHaveAttribute('data-testid', 'datasheet-results');
  });

  it('filters datasheets with role pills', async () => {
    const roleDatasheets = [
      createMockDatasheet({
        id: 'guilliman',
        slug: 'roboute-guilliman',
        name: 'Roboute Guilliman',
        keywords: keyword('EPIC HERO')
      }),
      createMockDatasheet({
        id: 'captain',
        slug: 'captain',
        name: 'Captain',
        keywords: keyword('CHARACTER')
      }),
      createMockDatasheet({
        id: 'intercessor',
        slug: 'intercessor-squad',
        name: 'Intercessor Squad',
        keywords: keyword('BATTLELINE')
      }),
      createMockDatasheet({
        id: 'predator',
        slug: 'predator-destructor',
        name: 'Predator Destructor',
        keywords: keyword('VEHICLE')
      })
    ];

    render(
      <TestWrapper>
        <DatasheetBrowser datasheets={roleDatasheets} />
      </TestWrapper>
    );

    const tabs = screen.getByRole('tablist', { name: 'Datasheet roles' });
    expect(tabs).toBeInTheDocument();
    expect(screen.getByTestId('datasheet-role-all')).toHaveTextContent('All');
    expect(screen.getByTestId('datasheet-role-all')).toHaveTextContent('4');
    expect(screen.getByTestId('datasheet-role-epic-hero')).toHaveTextContent('Epic Heroes');
    expect(screen.getByTestId('datasheet-role-epic-hero')).toHaveTextContent('1');
    expect(screen.getByTestId('datasheet-role-character')).toHaveTextContent('Characters');
    expect(screen.getByTestId('datasheet-role-character')).toHaveTextContent('1');
    expect(screen.getByTestId('datasheet-role-battleline')).toHaveTextContent('Battleline');
    expect(screen.getByTestId('datasheet-role-battleline')).toHaveTextContent('1');
    expect(screen.getByTestId('datasheet-role-other')).toHaveTextContent('Other Units');
    expect(screen.getByTestId('datasheet-role-other')).toHaveTextContent('1');

    expect(screen.getByText('Roboute Guilliman')).toBeInTheDocument();
    expect(screen.getByText('Captain')).toBeInTheDocument();
    expect(screen.getByText('Intercessor Squad')).toBeInTheDocument();
    expect(screen.getByText('Predator Destructor')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('datasheet-role-epic-hero'));

    expect(screen.getByText('Roboute Guilliman')).toBeInTheDocument();
    expect(screen.queryByText('Captain')).not.toBeInTheDocument();
    expect(screen.queryByText('Intercessor Squad')).not.toBeInTheDocument();
    expect(screen.queryByText('Predator Destructor')).not.toBeInTheDocument();
    expect(screen.queryByTestId('datasheet-search-clear')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('datasheet-role-all'));

    expect(screen.getByText('Captain')).toBeInTheDocument();
    expect(screen.getByText('Intercessor Squad')).toBeInTheDocument();
    expect(screen.getByText('Predator Destructor')).toBeInTheDocument();
  });

  it('shows search clear only when the query is non-empty and clears the query only', async () => {
    const roleDatasheets = [
      createMockDatasheet({
        id: 'captain',
        slug: 'captain',
        name: 'Captain',
        keywords: keyword('CHARACTER')
      }),
      createMockDatasheet({
        id: 'intercessor',
        slug: 'intercessor-squad',
        name: 'Intercessor Squad',
        keywords: keyword('BATTLELINE')
      })
    ];

    render(
      <TestWrapper>
        <DatasheetBrowser datasheets={roleDatasheets} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('datasheet-role-character'));
    expect(screen.queryByTestId('datasheet-search-clear')).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('datasheet-search'), { target: { value: 'cap' } });

    await waitFor(() => {
      expect(screen.getByTestId('datasheet-search-clear')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('datasheet-search-clear'));

    expect(screen.getByTestId('datasheet-search')).toHaveValue('');
    expect(screen.queryByTestId('datasheet-search-clear')).not.toBeInTheDocument();
    expect(screen.getByText('Captain')).toBeInTheDocument();
    expect(screen.queryByText('Intercessor Squad')).not.toBeInTheDocument();
  });
});
