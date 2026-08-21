import type { CardBadgeVariant } from '@/components/ui/card';

export interface StratagemTurnStyle {
  /** Badge colour for the turn label. */
  variant: CardBadgeVariant;
  /** Left rule on the card, so a long stratagem list scans by turn. */
  rule: string;
  /** CP gutter colour. */
  cp: string;
}

/* Red stays reserved for legality/over-points, so the opponent's turn reads blue. */
const YOUR_TURN: StratagemTurnStyle = {
  variant: 'accent',
  rule: 'border-l-border-accent',
  cp: 'text-accent'
};
const OPPONENT_TURN: StratagemTurnStyle = {
  variant: 'info',
  rule: 'border-l-info-fg',
  cp: 'text-info-fg'
};
const EITHER_TURN: StratagemTurnStyle = {
  variant: 'success',
  rule: 'border-l-success-fg',
  cp: 'text-success-fg'
};
const UNKNOWN_TURN: StratagemTurnStyle = {
  variant: 'muted',
  rule: 'border-l-border-strong',
  cp: 'text-muted'
};

/**
 * Wahapedia turn values arrive as "Your turn", "Opponent's turn" or
 * "Either player's turn" — with a curly apostrophe, so match on the keyword.
 */
export const getStratagemTurnStyle = (turn?: string): StratagemTurnStyle => {
  const value = turn?.toLowerCase() ?? '';

  if (value.includes('either')) return EITHER_TURN;
  if (value.includes('opponent')) return OPPONENT_TURN;
  if (value.includes('your')) return YOUR_TURN;
  return UNKNOWN_TURN;
};
