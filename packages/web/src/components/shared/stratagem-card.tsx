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
      className={cx('flex h-full flex-col gap-3 border-l-2', turnStyle.rule)}
      padding="md"
      data-testid="stratagem-card"
      data-turn={stratagem.turn}
    >
      <Card.Header className="items-start gap-3">
        <Card.Title className="text-sm font-bold capitalize leading-tight">
          {stratagem.name.toLowerCase()}
        </Card.Title>
        <Card.Badge variant="accent" className="font-mono tracking-wide whitespace-nowrap">
          {stratagem.cpCost}CP
        </Card.Badge>
      </Card.Header>

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
        dangerouslySetInnerHTML={{ __html: stratagem.description }}
      />
      {unitNames.length > 0 ? (
        <Card.Footer className="flex-col items-start gap-1 text-xs text-subtle">
          <span className="type-label">Available to:</span>
          <span className="text-foreground">{unitNames.join(', ')}</span>
        </Card.Footer>
      ) : null}
    </Card>
  );
};

export default StratagemCard;
