import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { depot } from '@depot/core';
import DatasheetAbilities from './datasheet-abilities';
import { TestWrapper } from '@/test/test-utils';

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  default: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  )
}));

vi.mock('@/components/ui/grid', () => ({
  default: ({ children }: any) => <div data-testid="grid">{children}</div>
}));

describe('DatasheetAbilities', () => {
  const mockAbilities: depot.Ability[] = [
    {
      id: 'LEADER',
      name: 'Leader',
      description: 'This model can be attached to a unit',
      legend: '',
      factionId: 'SM'
    },
    {
      id: 'OATH',
      name: 'Oath of Moment',
      description: 'Once per battle, this model can declare an oath',
      legend: '',
      factionId: 'SM'
    }
  ];

  it('renders abilities section when abilities exist', () => {
    render(<DatasheetAbilities abilities={mockAbilities} />, { wrapper: TestWrapper });

    expect(screen.getByTestId('abilities')).toBeInTheDocument();
    expect(screen.getByTestId('grid')).toBeInTheDocument();
    expect(screen.getAllByTestId('card')).toHaveLength(2);
  });

  it('returns null when no abilities provided', () => {
    const { container } = render(<DatasheetAbilities abilities={[]} />, { wrapper: TestWrapper });

    expect(container.firstChild).toBeNull();
  });

  it('renders each ability in a card', () => {
    render(<DatasheetAbilities abilities={mockAbilities} />, { wrapper: TestWrapper });

    expect(screen.getAllByTestId('card')).toHaveLength(2);
  });

  it('displays section heading', () => {
    render(<DatasheetAbilities abilities={mockAbilities} />, { wrapper: TestWrapper });

    expect(screen.getByTestId('abilities')).toBeInTheDocument();
  });
});
