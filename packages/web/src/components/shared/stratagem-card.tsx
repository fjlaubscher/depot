import React from 'react';
import type { depot } from '@depot/core';
import Card from '@/components/ui/card';
import { useAppContext } from '@/contexts/app/use-app-context';

interface StratagemCardProps {
  stratagem: depot.Stratagem;
}

const StratagemCard: React.FC<StratagemCardProps> = ({ stratagem }) => {
  const { state } = useAppContext();
  const showFluff = state.settings?.showFluff ?? true;

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
        separated
        className="flex-1"
        dangerouslySetInnerHTML={{ __html: stratagem.description }}
      />
    </Card>
  );
};

export default StratagemCard;
