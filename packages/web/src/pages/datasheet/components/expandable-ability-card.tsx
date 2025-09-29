import React from 'react';
import type { depot } from '@depot/core';
import { ContentCard } from '@/components/ui';
import { getAbilityTypeBadge } from '../utils/abilities';

interface ExpandableAbilityCardProps {
  ability: depot.Ability;
}

const ExpandableAbilityCard: React.FC<ExpandableAbilityCardProps> = ({ ability }) => {
  const badge = getAbilityTypeBadge(ability.type);

  const badges = [
    {
      text: badge.text,
      variant: badge.color.includes('blue')
        ? ('primary' as const)
        : badge.color.includes('green')
          ? ('success' as const)
          : badge.color.includes('yellow')
            ? ('warning' as const)
            : badge.color.includes('red')
              ? ('danger' as const)
              : ('secondary' as const)
    }
  ];

  return (
    <ContentCard title={ability.name} badges={badges} expandable>
      <div dangerouslySetInnerHTML={{ __html: ability.description }} />
    </ContentCard>
  );
};

export default ExpandableAbilityCard;
