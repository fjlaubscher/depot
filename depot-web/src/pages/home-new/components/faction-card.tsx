import React from 'react';
import { depot } from 'depot-core';
import { LinkCard } from '@/components/ui';

interface FactionCardProps {
  faction: depot.Index;
}

const FactionCard: React.FC<FactionCardProps> = ({ faction }) => {
  return (
    <LinkCard to={`/faction/${faction.id}`}>
      {faction.name}
    </LinkCard>
  );
};

export default FactionCard;