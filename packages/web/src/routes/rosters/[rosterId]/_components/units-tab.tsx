import React, { useMemo } from 'react';
import type { depot } from '@depot/core';
import { RosterSection } from '@/components/shared';
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
      <div
        className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg"
        data-testid="empty-roster-message"
      >
        <div className="flex flex-col gap-2">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No units in this roster</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Use the edit button to start building your roster
          </p>
        </div>
      </div>
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
