import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import WargearSelection from './index';
import { mockDatasheet } from '@/test/mock-data';

const wargear = mockDatasheet.wargear;

describe('WargearSelection', () => {
  it('renders wargear pills grouped by type', () => {
    render(
      <WargearSelection
        wargear={wargear}
        showSelectionColumn
        selectedWargear={[]}
        onSelectionChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('ranged-wargear-section')).toBeInTheDocument();
    expect(screen.getByTestId('mixed-wargear-section')).toBeInTheDocument();
    expect(screen.getByTestId('melee-wargear-section')).toBeInTheDocument();

    expect(screen.getByTestId('wargear-pill-captain-bolt-pistol')).toBeInTheDocument();
    expect(screen.getByTestId('wargear-pill-captain-plasma-gun')).toBeInTheDocument();
    expect(screen.getByTestId('wargear-pill-captain-power-sword')).toBeInTheDocument();
    expect(screen.getByTestId('wargear-pill-captain-thunder-hammer')).toBeInTheDocument();
  });

  it('toggles selection state when a pill is clicked', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    const { rerender } = render(
      <WargearSelection
        wargear={wargear}
        showSelectionColumn
        selectedWargear={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    const boltPistol = screen.getByTestId('wargear-pill-captain-bolt-pistol');
    expect(boltPistol).toHaveAttribute('aria-pressed', 'false');

    await user.click(boltPistol);
    expect(onSelectionChange).toHaveBeenCalledWith(wargear[0], true);

    rerender(
      <WargearSelection
        wargear={wargear}
        showSelectionColumn
        selectedWargear={[wargear[0]]}
        onSelectionChange={onSelectionChange}
      />
    );

    expect(screen.getByTestId('wargear-pill-captain-bolt-pistol')).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    await user.click(screen.getByTestId('wargear-pill-captain-bolt-pistol'));
    expect(onSelectionChange).toHaveBeenLastCalledWith(wargear[0], false);
  });

  it('does not toggle when selection is disabled', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    render(
      <WargearSelection
        wargear={wargear}
        showSelectionColumn={false}
        selectedWargear={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    const boltPistol = screen.getByTestId('wargear-pill-captain-bolt-pistol');
    expect(boltPistol).toBeDisabled();

    await user.click(boltPistol);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
