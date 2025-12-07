import React from 'react';
import type { depot } from '@depot/core';
import Card from '@/components/ui/card';
import useSettings from '@/hooks/use-settings';

interface StratagemCardProps {
  stratagem: depot.Stratagem;
  unitNames?: string[];
}

const StratagemCard: React.FC<StratagemCardProps> = ({ stratagem, unitNames = [] }) => {
  const { settings } = useSettings();
  const showFluff = settings.showFluff ?? true;

  return (
    <Card className="flex h-full flex-col gap-3" padding="md">
      <Card.Header className="items-start gap-3">
        <Card.Title className="text-sm font-semibold capitalize leading-tight">
          {stratagem.name.toLowerCase()}
        </Card.Title>
        <Card.Badge variant="accent" className="uppercase tracking-wide">
          {stratagem.cpCost}CP
        </Card.Badge>
      </Card.Header>

      {showFluff && stratagem.legend ? (
        <Card.Legend className="text-sm">{stratagem.legend}</Card.Legend>
      ) : null}

      <Card.Badge variant="muted" className="self-start uppercase tracking-wide">
        {stratagem.type}
      </Card.Badge>

      <Card.Content
        className="flex-1"
        dangerouslySetInnerHTML={{ __html: stratagem.description }}
      />
      {unitNames.length > 0 ? (
        <Card.Footer className="flex-col items-start gap-1 text-xs text-subtle">
          <span className="font-semibold uppercase tracking-wide text-secondary">
            Available to:
          </span>
          <span className="text-foreground">{unitNames.join(', ')}</span>
        </Card.Footer>
      ) : null}
    </Card>
  );
};

export default StratagemCard;
