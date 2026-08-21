import { describe, it, expect } from 'vitest';
import { getStratagemTurnStyle } from './stratagem-styles';

describe('getStratagemTurnStyle', () => {
  it.each([
    ['Your turn', 'success'],
    ['Opponent’s turn', 'danger'],
    ['Either player’s turn', 'info'],
    ["Opponent's turn", 'danger'],
    [undefined, 'muted'],
    ['', 'muted']
  ])('maps %s to the %s variant', (turn, variant) => {
    expect(getStratagemTurnStyle(turn).variant).toBe(variant);
  });

  it('prefers "either" over "your" when both words appear', () => {
    expect(getStratagemTurnStyle('Either player’s turn').variant).toBe('info');
  });
});
