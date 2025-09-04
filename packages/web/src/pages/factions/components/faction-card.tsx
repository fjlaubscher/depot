import React from 'react';
import { Link } from 'react-router-dom';
import { depot } from '@depot/core';

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
    <Link
      to={`/faction/${faction.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
    >
      <div className="flex">
        {/* Faction Image Placeholder */}
        <div className="w-20 bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center rounded-l-lg">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 flex-1 min-w-0 p-4">
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
      </div>
    </Link>
  );
};

export default FactionCard;
