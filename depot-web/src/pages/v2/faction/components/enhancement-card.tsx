import React from 'react';
import { depot } from 'depot-core';
import Card from '@/components/ui/card';

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
            <span className="flex-shrink-0 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {enhancement.cost} pts
            </span>
          )}
          {enhancement.detachment && (
            <span className="flex-shrink-0 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {enhancement.detachment}
            </span>
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
