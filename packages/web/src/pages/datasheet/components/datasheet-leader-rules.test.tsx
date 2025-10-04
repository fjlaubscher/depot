import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { createMockDatasheet } from '@/test/mock-data';
import DatasheetLeaderRules from './datasheet-leader-rules';

describe('DatasheetLeaderRules', () => {
  it('does not render when no leader information is available', () => {
    const datasheet = createMockDatasheet({
      leaderHead: '',
      leaderFooter: '',
      leaders: []
    });

    render(
      <MemoryRouter>
        <DatasheetLeaderRules datasheet={datasheet} factionDatasheets={[datasheet]} />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('datasheet-leader-rules')).not.toBeInTheDocument();
  });

  it('renders leader head, linked units, and footer when provided', () => {
    const targetDatasheet = createMockDatasheet({
      id: 'intercessors',
      slug: 'intercessor-squad',
      name: 'Intercessor Squad'
    });

    const leaderDatasheet = createMockDatasheet({
      leaderHead: '<p>This model can be attached to one of the following units:</p>',
      leaderFooter: '<p>While attached, this model shares their fate.</p>',
      leaders: [
        {
          id: 'intercessors',
          slug: 'intercessor-squad'
        }
      ]
    });

    render(
      <MemoryRouter>
        <DatasheetLeaderRules
          datasheet={leaderDatasheet}
          factionDatasheets={[leaderDatasheet, targetDatasheet]}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('datasheet-leader-rules')).toBeInTheDocument();
    expect(
      screen.getByText('This model can be attached to one of the following units:')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Intercessor Squad' })).toHaveAttribute(
      'href',
      '/faction/space-marines/datasheet/intercessor-squad'
    );
    expect(screen.getByText('While attached, this model shares their fate.')).toBeInTheDocument();
  });

  it('falls back to formatted slug when target datasheet is missing', () => {
    const leaderDatasheet = createMockDatasheet({
      leaderHead: '<p>Attach to the following:</p>',
      leaderFooter: '',
      leaders: [
        {
          id: 'reivers',
          slug: 'reiver-squad'
        }
      ]
    });

    render(
      <MemoryRouter>
        <DatasheetLeaderRules datasheet={leaderDatasheet} factionDatasheets={[leaderDatasheet]} />
      </MemoryRouter>
    );

    expect(screen.getByText('Reiver Squad')).toBeInTheDocument();
  });
});
