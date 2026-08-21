import { describe, it, expect } from 'vitest';
import { getStratagemTurnStyle } from './stratagem-styles';

describe('getStratagemTurnStyle', () => {
  it.each([
    ['Your turn', 'accent'],
    ['Opponent’s turn', 'info'],
    ['Either player’s turn', 'success'],
    ["Opponent's turn", 'info'],
    [undefined, 'muted'],
    ['', 'muted']
  ])('maps %s to the %s variant', (turn, variant) => {
    expect(getStratagemTurnStyle(turn).variant).toBe(variant);
  });

  it('prefers "either" over "your" when both words appear', () => {
    expect(getStratagemTurnStyle('Either player’s turn').variant).toBe('success');
  });
});
