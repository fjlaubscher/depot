import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DetachmentCard from './detachment-card';
import { TestWrapper } from '@/test/test-utils';
import { createMockDetachment } from '@/test/mock-data';

describe('DetachmentCard', () => {
  it('shows DP, force disposition, boarding tag, and chapter DP', () => {
    render(
      <TestWrapper>
        <DetachmentCard
          isOpen
          onToggle={() => undefined}
          detachment={createMockDetachment({
            name: 'Gladius Task Force',
            dp: '2',
            forceDisposition: 'Take and Hold',
            type: '',
            chapterDp: [{ keyword: 'Black Templars', dp: '2' }]
          })}
        />
      </TestWrapper>
    );

    expect(screen.getAllByText('Gladius Task Force').length).toBeGreaterThan(0);
    expect(screen.getByTestId('detachment-meta')).toHaveTextContent('2 DP');
    expect(screen.getByTestId('detachment-meta')).toHaveTextContent('Take and Hold');
    expect(screen.getByTestId('detachment-chapter-dp')).toHaveTextContent('Black Templars 2 DP');
  });

  it('tags boarding actions detachments', () => {
    render(
      <TestWrapper>
        <DetachmentCard
          isOpen
          onToggle={() => undefined}
          detachment={createMockDetachment({
            name: 'Shield of the Void',
            type: 'Boarding Actions',
            dp: '',
            forceDisposition: '',
            chapterDp: []
          })}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('detachment-meta')).toHaveTextContent('Boarding Actions');
    expect(screen.getByTestId('detachment-meta')).not.toHaveTextContent('DP');
  });
});
