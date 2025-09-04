import React from 'react';
import { depot } from '@depot/core';
import FactionGrid from './faction-grid';

interface AllianceSectionProps {
  alliance: string;
  factions: depot.Index[];
  loading?: boolean;
}

const AllianceSection: React.FC<AllianceSectionProps> = ({
  alliance,
  factions,
  loading = false
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{alliance}</h2>
        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full font-medium">
          {factions.length} {factions.length === 1 ? 'faction' : 'factions'}
        </span>
      </div>
      <FactionGrid factions={factions} loading={loading} />
    </div>
  );
};

export default AllianceSection;
