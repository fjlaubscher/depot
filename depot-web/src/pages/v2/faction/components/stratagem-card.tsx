import React from 'react';
import { depot } from 'depot-core';
import Card from '@/components/ui/card';

interface StratagemCardProps {
  stratagem: depot.Stratagem;
}

const StratagemCard: React.FC<StratagemCardProps> = ({ stratagem }) => {
  return (
    <Card className="p-4 space-y-3 h-full">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900 dark:text-white capitalize text-sm leading-tight">
          {stratagem.name.toLowerCase()}
        </h3>
        <span className="flex-shrink-0 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {stratagem.cpCost}CP
        </span>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-300 font-medium uppercase tracking-wide">
        {stratagem.type}
      </div>

      {stratagem.legend && (
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium italic">
          {stratagem.legend}
        </div>
      )}

      <div 
        className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: stratagem.description }}
      />
    </Card>
  );
};

export default StratagemCard;
