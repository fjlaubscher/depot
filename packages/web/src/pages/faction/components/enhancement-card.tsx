import React from 'react';
import type { depot } from '@depot/core';
import Card from '@/components/ui/card';
import Tag from '@/components/ui/tag';
import { useAppContext } from '@/contexts/app/use-app-context';

interface EnhancementCardProps {
  enhancement: depot.Enhancement;
}

const EnhancementCard: React.FC<EnhancementCardProps> = ({ enhancement }) => {
  const { state } = useAppContext();
  const showFluff = state.settings?.showFluff ?? true;

  return (
    <Card className="p-4 space-y-2 h-full">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
          {enhancement.name}
        </h3>
        {enhancement.cost ? (
          <Tag variant="success" size="sm">
            {enhancement.cost} pts
          </Tag>
        ) : null}
      </div>

      {showFluff && enhancement.legend ? (
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium italic">
          {enhancement.legend}
        </div>
      ) : null}

      <div
        className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: enhancement.description }}
      />
    </Card>
  );
};

export default EnhancementCard;
