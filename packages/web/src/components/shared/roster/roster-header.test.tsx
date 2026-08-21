import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import RosterHeader from './roster-header';

const points = (current: number, max?: number) => ({ points: { current, max } });

describe('RosterHeader', () => {
  it('shows the overspend and a danger bar when over the cap', () => {
    render(<RosterHeader roster={points(1045, 1000)} />);

    expect(screen.getByTestId('points-display')).toHaveTextContent('1045/1000');
    expect(screen.getByTestId('points-over')).toHaveTextContent('+45 over');
    // bar never exceeds 100% even though the list does
    expect(screen.getByTestId('points-bar').firstElementChild).toHaveStyle({ width: '100%' });
  });

  it('fills proportionally when under the cap', () => {
    render(<RosterHeader roster={points(500, 2000)} />);

    expect(screen.queryByTestId('points-over')).not.toBeInTheDocument();
    expect(screen.getByTestId('points-bar').firstElementChild).toHaveStyle({ width: '25%' });
  });

  it('omits the bar when the roster has no points cap', () => {
    render(<RosterHeader roster={points(320)} />);

    expect(screen.getByTestId('points-display')).toHaveTextContent('320');
    expect(screen.queryByTestId('points-bar')).not.toBeInTheDocument();
  });
});
