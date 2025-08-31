import React from 'react';
import { depot } from 'depot-core';
import Card from '@/components/ui/card';

interface DetachmentAbilityCardProps {
  ability: depot.DetachmentAbility;
}

const DetachmentAbilityCard: React.FC<DetachmentAbilityCardProps> = ({ ability }) => {
  return (
    <Card className="p-4 space-y-3 h-full">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
          {ability.name}
        </h3>
        {ability.detachment && (
          <span className="flex-shrink-0 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            {ability.detachment}
          </span>
        )}
      </div>

      {ability.legend && (
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
