import React from 'react';
import type { depot } from '@depot/core';
import { cx } from '@/utils/cx';
import Card from '@/components/ui/card';
import { getStratagemTurnStyle } from '@/utils/stratagem-styles';

interface StratagemCardProps {
  stratagem: depot.Stratagem;
  unitNames?: string[];
}

const StratagemCard: React.FC<StratagemCardProps> = ({ stratagem, unitNames = [] }) => {
  const turnStyle = getStratagemTurnStyle(stratagem.turn);

  return (
    <Card
      className={cx('flex h-full flex-row overflow-hidden border-l-2', turnStyle.rule)}
      padding="none"
      data-testid="stratagem-card"
      data-turn={stratagem.turn}
    >
      {/* CP gutter — the cost is what you scan for mid-game, so it gets its own column */}
      <div className="flex w-11 flex-none flex-col items-center justify-center border-r border-border-subtle">
        <span className={cx('font-mono text-[17px] leading-none font-bold', turnStyle.cp)}>
          {stratagem.cpCost}
        </span>
        <span className="mt-0.5 font-mono text-[8px] leading-none font-bold text-subtle">CP</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <Card.Title className="text-sm font-bold capitalize leading-tight">
          {stratagem.name.toLowerCase()}
        </Card.Title>

        {stratagem.legend ? (
          <Card.Legend className="ShowFluff text-sm">{stratagem.legend}</Card.Legend>
        ) : null}

        <div className="flex flex-wrap items-center gap-1">
          {stratagem.turn ? (
            <Card.Badge
              variant={turnStyle.variant}
              className="type-label uppercase"
              data-testid="stratagem-turn"
            >
              {stratagem.turn}
            </Card.Badge>
          ) : null}
          {stratagem.phase ? (
            <Card.Badge variant="muted" className="type-label uppercase">
              {stratagem.phase}
            </Card.Badge>
          ) : null}
          <Card.Badge variant="muted" className="type-label uppercase">
            {stratagem.type}
          </Card.Badge>
        </div>

        <Card.Content
          className="flex-1"
          dangerouslySetInnerHTML={{ __html: stratagem.description ?? '' }}
        />
        {unitNames.length > 0 ? (
          <Card.Footer className="flex-col items-start gap-1 text-xs text-subtle">
            <span className="type-label">Available to:</span>
            <span className="text-foreground">{unitNames.join(', ')}</span>
          </Card.Footer>
        ) : null}
      </div>
    </Card>
  );
};

export default StratagemCard;
