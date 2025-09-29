import React from 'react';
import type { depot } from '@depot/core';
import { ContentCard } from '@/components/ui';

interface EnhancementCardProps {
  enhancement: depot.Enhancement;
}

const EnhancementCard: React.FC<EnhancementCardProps> = ({ enhancement }) => {
  const badges = [];

  if (enhancement.cost) {
    badges.push({ text: `${enhancement.cost} pts`, variant: 'success' as const });
  }

  if (enhancement.detachment) {
    badges.push({ text: enhancement.detachment, variant: 'secondary' as const });
  }

  return (
    <ContentCard title={enhancement.name} legend={enhancement.legend} badges={badges}>
      <div dangerouslySetInnerHTML={{ __html: enhancement.description }} />
    </ContentCard>
  );
};

export default EnhancementCard;
