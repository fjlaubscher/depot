import React from 'react';
import type { depot } from '@depot/core';
import Card from '@/components/ui/card';
import Tag from '@/components/ui/tag';
import { useAppContext } from '@/contexts/app/use-app-context';

interface StratagemCardProps {
  stratagem: depot.Stratagem;
}

const StratagemCard: React.FC<StratagemCardProps> = ({ stratagem }) => {
  const { state } = useAppContext();
  const showFluff = state.settings?.showFluff ?? true;

  return (
    <Card className="p-4 h-full">
      <div className="flex flex-col gap-2 h-full">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white capitalize text-sm leading-tight">
            {stratagem.name.toLowerCase()}
          </h3>
          <Tag variant="primary" size="sm">
            {stratagem.cpCost}CP
          </Tag>
        </div>

        {showFluff && stratagem.legend ? (
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium italic">
            {stratagem.legend}
          </div>
        ) : null}

        <div className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
          {stratagem.type}
        </div>

        <div
          className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: stratagem.description }}
        />
      </div>
    </Card>
  );
};

export default StratagemCard;
