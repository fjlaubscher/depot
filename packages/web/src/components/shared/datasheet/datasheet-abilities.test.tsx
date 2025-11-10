import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DatasheetAbilities } from './datasheet-abilities';

const mockAbilities = [
  {
    id: 'core-2',
    name: 'Fallback Doctrine',
    type: 'Core',
    description: '<p>Fallback doctrine description</p>',
    legend: '',
    factionId: 'SM',
    parameter: '6"'
  },
  {
    id: 'core-1',
    name: 'Advance Doctrine',
    type: 'Core',
    description: '<p>Advance doctrine description</p>',
    legend: '',
    factionId: 'SM',
    parameter: '3"'
  }
];

describe('DatasheetAbilities', () => {
  it('renders ability tags sorted alphabetically', () => {
    render(<DatasheetAbilities title="Core Abilities" abilities={mockAbilities} />);

    expect(screen.getByText(/click a tag to view full rules/i)).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent(/advance doctrine 3"/i);
    expect(buttons[1]).toHaveTextContent(/fallback doctrine 6"/i);
  });

  it('opens modal with ability details when a tag is clicked', async () => {
    const user = userEvent.setup();
    render(<DatasheetAbilities title="Core Abilities" abilities={mockAbilities} />);

    await user.click(screen.getByRole('button', { name: /advance doctrine/i }));

    expect(screen.getByTestId('ability-modal')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /advance doctrine 3"/i })).toBeInTheDocument();
    expect(screen.getByText('Advance doctrine description')).toBeInTheDocument();

    await user.click(screen.getByTestId('ability-modal-close'));
    expect(screen.queryByTestId('ability-modal')).not.toBeInTheDocument();
  });

  it('returns null when no abilities are provided', () => {
    const { container } = render(<DatasheetAbilities title="Core Abilities" abilities={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
