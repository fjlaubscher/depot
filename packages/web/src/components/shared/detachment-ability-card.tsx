import React from 'react';
import type { depot } from '@depot/core';
import Card from '@/components/ui/card';
import Tag from '@/components/ui/tag';

interface DetachmentAbilityCardProps {
  ability: depot.DetachmentAbility;
}

const DetachmentAbilityCard: React.FC<DetachmentAbilityCardProps> = ({ ability }) => {
  return (
    <Card className="p-4 space-y-2 h-full border-t-2 border-t-border-accent">
      <p className="type-section">Detachment ability</p>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-foreground text-base leading-tight">{ability.name}</h3>
        {ability.detachment && (
          <Tag variant="default" size="sm" className="type-label uppercase">
            {ability.detachment}
          </Tag>
        )}
      </div>
    </Card>
  );
};

export default DetachmentAbilityCard;
