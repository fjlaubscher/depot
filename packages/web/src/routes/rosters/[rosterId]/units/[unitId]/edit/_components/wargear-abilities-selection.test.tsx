import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { slugify } from '@depot/core/utils/slug';

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

    const firstPillId = `wargear-ability-pill-${slugify('Grenade Volley')}`;
    const secondPillId = `wargear-ability-pill-${slugify('Armour Piercer')}`;
    const firstPill = screen.getByTestId(firstPillId);
    const secondPill = screen.getByTestId(secondPillId);

    expect(firstPill).toHaveAttribute('aria-pressed', 'false');
    expect(secondPill).toHaveAttribute('aria-pressed', 'false');

    await user.click(firstPill);

    expect(firstPill).toHaveAttribute('aria-pressed', 'true');
    expect(secondPill).toHaveAttribute('aria-pressed', 'false');
  });

  it('allows selecting multiple abilities separately', async () => {
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

    const firstPillId = `wargear-ability-pill-${slugify('Grenade Volley')}`;
    const secondPillId = `wargear-ability-pill-${slugify('Armour Piercer')}`;
    const firstPill = screen.getByTestId(firstPillId);
    const secondPill = screen.getByTestId(secondPillId);

    expect(firstPill).toHaveAttribute('aria-pressed', 'true');
    expect(secondPill).toHaveAttribute('aria-pressed', 'false');

    await user.click(secondPill);

    expect(firstPill).toHaveAttribute('aria-pressed', 'true');
    expect(secondPill).toHaveAttribute('aria-pressed', 'true');
  });
});
