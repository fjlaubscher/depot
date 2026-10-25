import { describe, it, expect } from 'vitest';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import i18n from '@/i18n';
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
  it('keeps disposition and search values when translating controls and empty results', async () => {
    render(<FactionDetachments factionSlug="space-marines" detachments={detachments} />, {
      wrapper: TestWrapper
    });
    fireEvent.change(screen.getByLabelText('Filter by force disposition'), {
      target: { value: '2' }
    });
    fireEvent.change(screen.getByTestId('detachment-search'), { target: { value: 'gladius' } });
    await waitFor(() => expect(screen.getAllByTestId('detachment-card')).toHaveLength(1));
    await act(() => i18n.changeLanguage('fr'));
    expect(screen.getByLabelText('Filtrer par disposition de force')).toHaveValue('2');
    expect(screen.getByTestId('detachment-search')).toHaveValue('gladius');
    expect(screen.getByTestId('detachment-card')).toHaveTextContent('Gladius Task Force');
    expect(screen.getByTestId('detachment-card')).toHaveTextContent('Take and Hold');
    expect(screen.getByTestId('detachment-card')).toHaveAttribute(
      'href',
      '/faction/space-marines/detachment/gladius-task-force'
    );
    fireEvent.change(screen.getByTestId('detachment-search'), { target: { value: 'absent' } });
    await waitFor(() =>
      expect(
        screen.getByText('Aucun détachement ne correspond à votre recherche.')
      ).toBeInTheDocument()
    );
    await act(() => i18n.changeLanguage('en'));
    expect(
      screen.getByText('No detachments found matching your search criteria.')
    ).toBeInTheDocument();
  });

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
