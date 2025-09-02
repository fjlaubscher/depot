import React from 'react';
import { depot } from '@depot/core';
import Card from '@/components/ui/card';
import Tag from '@/components/ui/tag';

interface EnhancementCardProps {
  enhancement: depot.Enhancement;
}

const EnhancementCard: React.FC<EnhancementCardProps> = ({ enhancement }) => {
  return (
    <Card className="p-4 space-y-3 h-full">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
          {enhancement.name}
        </h3>
        <div className="flex flex-col gap-1">
          {enhancement.cost && (
            <Tag variant="success" size="sm">
              {enhancement.cost} pts
            </Tag>
          )}
          {enhancement.detachment && (
            <Tag variant="secondary" size="sm">
              {enhancement.detachment}
            </Tag>
          )}
        </div>
      </div>

      {enhancement.legend && (
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium italic">
          {enhancement.legend}
        </div>
      )}

      <div
        className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: enhancement.description }}
      />
    </Card>
  );
};

export default EnhancementCard;
