import React, { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { depot } from '@depot/core';
import { RosterUnitCardCompact } from '@/components/shared/roster';
import UnitDetails from './unit-details';

interface ViewRosterUnitCardProps {
  unit: depot.RosterUnit;
}

const ViewRosterUnitCard: React.FC<ViewRosterUnitCardProps> = ({ unit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = (
    <div className="text-hint cursor-pointer" aria-hidden="true">
      {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
    </div>
  );

  return (
    <RosterUnitCardCompact
      id={`unit-${unit.id}`}
      unit={unit}
      actions={actions}
      onClick={() => setIsExpanded((prev) => !prev)}
      showWargearSummary={!isExpanded}
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
