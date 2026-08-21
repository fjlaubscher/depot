import React, { useMemo } from 'react';
import type { depot } from '@depot/core';
import { RosterEmptyState, RosterSection } from '@/components/shared';
import ViewRosterUnitCard from './view-roster-unit-card';

interface UnitsTabProps {
  units: depot.RosterUnit[];
}

const UnitsTab: React.FC<UnitsTabProps> = ({ units }) => {
  const sortedUnits = useMemo(
    () => [...units].sort((a, b) => a.datasheet.name.localeCompare(b.datasheet.name)),
    [units]
  );

  if (units.length === 0) {
    return <RosterEmptyState title="No units in this roster" dataTestId="empty-roster-message" />;
  }

  return (
    <div className="flex flex-col gap-4" data-testid="units-tab">
      <RosterSection title={`Units (${sortedUnits.length})`}>
        <div className="flex flex-col gap-4">
          {sortedUnits.map((unit) => (
            <ViewRosterUnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      </RosterSection>
    </div>
  );
};

export default UnitsTab;
