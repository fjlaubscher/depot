import React from 'react';
import { depot } from 'depot-core';
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
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
          {alliance}
        </h2>
      </div>
      <FactionGrid factions={factions} loading={loading} />
    </div>
  );
};

export default AllianceSection;