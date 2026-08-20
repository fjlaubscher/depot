import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FactionDetachments from './faction-detachments';
import { TestWrapper } from '@/test/test-utils';
import { createMockDetachment } from '@/test/mock-data';

const detachments = [
  createMockDetachment({
    id: '1',
    slug: 'gladius-task-force',
    name: 'Gladius Task Force',
    dp: '2',
    forceDisposition: 'Take and Hold',
    type: '',
    chapterDp: [{ keyword: 'Black Templars', dp: '3' }]
  }),
  createMockDetachment({
    id: '2',
    slug: 'shield-of-the-void',
    name: 'Shield of the Void',
    dp: '',
    forceDisposition: '',
    type: 'Boarding Actions',
    chapterDp: []
  })
];

describe('FactionDetachments', () => {
  it('links each detachment to its page with DP, disposition, boarding and chapter DP meta', () => {
    render(
      <TestWrapper>
        <FactionDetachments factionSlug="space-marines" detachments={detachments} />
      </TestWrapper>
    );

    const cards = screen.getAllByTestId('detachment-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAttribute(
      'href',
      '/faction/space-marines/detachment/gladius-task-force'
    );
    expect(cards[0]).toHaveTextContent('2 DP');
    expect(cards[0]).toHaveTextContent('Take and Hold');
    expect(screen.getByTestId('detachment-chapter-dp')).toHaveTextContent('Black Templars 3 DP');
    expect(cards[1]).toHaveTextContent('Boarding Actions');
    expect(cards[1]).not.toHaveTextContent('DP');
  });

  it('filters by name and force disposition', () => {
    render(
      <TestWrapper>
        <FactionDetachments factionSlug="space-marines" detachments={detachments} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByLabelText('Filter by force disposition'), {
      target: { value: '1' }
    });
    expect(screen.getAllByTestId('detachment-card')).toHaveLength(1);
    expect(screen.getByTestId('detachment-card')).toHaveTextContent('Shield of the Void');
  });
});
