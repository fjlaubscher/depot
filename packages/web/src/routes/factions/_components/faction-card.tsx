import React from 'react';
import type { depot } from '@depot/core';
import { LinkCard } from '@/components/ui';

interface FactionCardProps {
  faction: depot.Index;
}

const FactionCard: React.FC<FactionCardProps> = ({ faction }) => {
  const stats = [
    { label: 'Datasheets', value: faction.datasheetCount || 0 },
    { label: 'Stratagems', value: faction.stratagemCount || 0 },
    { label: 'Enhancements', value: faction.enhancementCount || 0 },
    { label: 'Detachments', value: faction.detachmentCount || 0 }
  ].filter((stat) => stat.value > 0);

  return (
    <LinkCard to={`/faction/${faction.slug}`}>
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-primary-600 dark:text-primary-400 text-lg">
          {faction.name}
        </h3>

        {stats.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {stats.map((stat) => (
              <span
                key={stat.label}
                className="inline-flex items-center text-xs bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded font-medium"
              >
                {stat.value} {stat.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </LinkCard>
  );
};

export default FactionCard;
