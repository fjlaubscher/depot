import React, { useMemo } from 'react';
import type { depot } from '@depot/core';
import { RosterEmptyState, RosterSection } from '@/components/shared';
import { groupRosterUnitsByRole } from '@/utils/roster';
import ViewRosterUnitCard from './view-roster-unit-card';

interface UnitsTabProps {
  units: depot.RosterUnit[];
}

const UnitsTab: React.FC<UnitsTabProps> = ({ units }) => {
  const groupedUnits = useMemo(() => groupRosterUnitsByRole(units), [units]);
  const roleKeys = useMemo(() => Object.keys(groupedUnits).sort(), [groupedUnits]);

  if (units.length === 0) {
    return (
      <RosterEmptyState
        title="No units in this roster"
        description="Use the edit button to start building your roster"
        dataTestId="empty-roster-message"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid="units-tab">
      {roleKeys.map((role) => (
        <RosterSection
          key={role}
          title={`${role.toUpperCase()} (${groupedUnits[role].length})`}
          data-testid="unit-role-section"
        >
          {groupedUnits[role].map((unit) => (
            <ViewRosterUnitCard key={unit.id} unit={unit} />
          ))}
        </RosterSection>
      ))}
    </div>
  );
};

export default UnitsTab;
