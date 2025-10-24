import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { depot } from '@depot/core';
import { RosterUnitCardCompact } from '@/components/shared/roster';
import UnitDetails from './unit-details';

interface ViewRosterUnitCardProps {
  unit: depot.RosterUnit;
}

const ViewRosterUnitCard: React.FC<ViewRosterUnitCardProps> = ({ unit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = (
    <div className="text-gray-400 dark:text-gray-500 cursor-pointer">
      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </div>
  );

  return (
    <RosterUnitCardCompact
      unit={unit}
      actions={actions}
      onClick={() => setIsExpanded((prev) => !prev)}
    >
      {isExpanded ? (
        <div
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <UnitDetails unit={unit} />
        </div>
      ) : null}
    </RosterUnitCardCompact>
  );
};

export default ViewRosterUnitCard;
