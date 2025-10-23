import React from 'react';
import type { depot } from '@depot/core';
import Card from '@/components/ui/card';
import Tag from '@/components/ui/tag';
import { useAppContext } from '@/contexts/app/use-app-context';

interface DetachmentAbilityCardProps {
  ability: depot.DetachmentAbility;
}

const DetachmentAbilityCard: React.FC<DetachmentAbilityCardProps> = ({ ability }) => {
  const { state } = useAppContext();
  const showFluff = state.settings?.showFluff ?? true;

  return (
    <Card className="p-4 space-y-2 h-full">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
          {ability.name}
        </h3>
        {ability.detachment && (
          <Tag variant="secondary" size="sm">
            {ability.detachment}
          </Tag>
        )}
      </div>

      {showFluff && ability.legend && (
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium italic">
          {ability.legend}
        </div>
      )}

      <div
        className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: ability.description }}
      />
    </Card>
  );
};

export default DetachmentAbilityCard;
