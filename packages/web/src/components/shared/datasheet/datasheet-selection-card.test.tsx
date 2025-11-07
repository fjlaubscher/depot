import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DatasheetSelectionCard } from './datasheet-selection-card';
import { createMockDatasheet } from '@/test/mock-data';

describe('DatasheetSelectionCard', () => {
  const baseProps = {
    datasheet: createMockDatasheet(),
    onAdd: vi.fn(),
    getUnitCount: vi.fn().mockReturnValue(0)
  };

  it('renders faction keywords as tags', () => {
    render(<DatasheetSelectionCard {...baseProps} />);

    const keywordRow = screen.getByTestId('faction-keywords');
    expect(keywordRow).toBeInTheDocument();
    expect(keywordRow).toHaveTextContent('IMPERIUM');
    expect(keywordRow).toHaveTextContent('ADEPTUS ASTARTES');
  });
});
