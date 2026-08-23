import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import SelectionSummary from './selection-summary';
import { createMockDatasheet } from '@/test/mock-data';

describe('SelectionSummary', () => {
  const datasheet = createMockDatasheet();
  const modelCost = datasheet.modelCosts[0];

  it('renders a filled-accent review chip instead of muted-on-surface-base', () => {
    render(
      <SelectionSummary
        groups={[{ count: 3, datasheet, modelCost }]}
        selectedUnitsCount={3}
        totalPoints={240}
        onClear={vi.fn()}
        onConfirm={vi.fn()}
        onIncrement={vi.fn()}
        onDecrement={vi.fn()}
        isOpen={false}
        onOpenChange={vi.fn()}
      />
    );

    const chip = screen.getByRole('button', { name: /Review Selection/i });
    expect(chip.className).toMatch(/bg-accent-600/);
    expect(chip.className).toMatch(/text-accent-ink/);
    expect(chip.className).not.toMatch(/bg-surface-base/);
    expect(chip).toHaveTextContent('3 units • 240 pts');
    expect(chip.querySelector('.text-muted')).toBeNull();
  });

  it('does not render the chip when nothing is selected', () => {
    render(
      <SelectionSummary
        groups={[]}
        selectedUnitsCount={0}
        totalPoints={0}
        onClear={vi.fn()}
        onConfirm={vi.fn()}
        onIncrement={vi.fn()}
        onDecrement={vi.fn()}
        isOpen={false}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /Review Selection/i })).not.toBeInTheDocument();
  });
});
