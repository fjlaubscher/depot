import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import WargearAbilitiesSelection from './wargear-abilities-selection';
import { TestWrapper } from '@/test/test-utils';
import { createMockWargearAbility } from '@/test/mock-data';

const abilities = [
  createMockWargearAbility({ id: 'ability-1', name: 'Grenade Volley' }),
  createMockWargearAbility({ id: 'ability-2', name: 'Armour Piercer' })
];

describe('WargearAbilitiesSelection', () => {
  it('toggles only the clicked wargear ability', async () => {
    const TestComponent = () => {
      const [selected, setSelected] = React.useState<typeof abilities>([]);

      return (
        <WargearAbilitiesSelection
          abilities={abilities}
          selected={selected}
          onChange={setSelected}
        />
      );
    };

    const user = userEvent.setup();

    render(<TestComponent />, { wrapper: TestWrapper });

    const firstPill = screen.getByTestId('wargear-ability-pill-ability-1');
    const secondPill = screen.getByTestId('wargear-ability-pill-ability-2');

    expect(firstPill).toHaveAttribute('aria-pressed', 'false');
    expect(secondPill).toHaveAttribute('aria-pressed', 'false');

    await user.click(firstPill);

    expect(firstPill).toHaveAttribute('aria-pressed', 'true');
    expect(secondPill).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders tags for selected wargear abilities', async () => {
    const TestComponent = () => {
      const [selected, setSelected] = React.useState([abilities[0]]);

      return (
        <WargearAbilitiesSelection
          abilities={abilities}
          selected={selected}
          onChange={setSelected}
        />
      );
    };

    const user = userEvent.setup();

    render(<TestComponent />, { wrapper: TestWrapper });

    const tagList = screen.getByTestId('selected-wargear-ability-tags');
    expect(tagList).toHaveTextContent('Grenade Volley');
    expect(tagList).not.toHaveTextContent('Armour Piercer');

    await user.click(screen.getByTestId('wargear-ability-pill-ability-2'));

    expect(screen.getByTestId('selected-wargear-ability-tags')).toHaveTextContent('Armour Piercer');
  });
});
