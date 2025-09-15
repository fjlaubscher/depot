import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { depot } from '@depot/core';
import UnitDetails from './unit-details';

interface ViewRosterUnitCardProps {
  unit: depot.RosterUnit;
}

const ViewRosterUnitCard: React.FC<ViewRosterUnitCardProps> = ({ unit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const unitPoints = parseInt(unit.modelCost.cost, 10) || 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Collapsed Header - Always Visible */}
      <div
        className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col gap-2">
          <div className="text-base font-medium text-gray-900 dark:text-white">
            {unit.datasheet.name}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {unit.modelCost.description}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
            {unitPoints} pts
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Details - Game Stats */}
      {isExpanded && <UnitDetails unit={unit} />}
    </div>
  );
};

export default ViewRosterUnitCard;
