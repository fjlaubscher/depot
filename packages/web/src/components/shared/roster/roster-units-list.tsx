import React, { useMemo } from 'react';
import { depot } from '@depot/core';
import { CollapsibleSection } from '@/components/ui';
import RosterUnitCard from './roster-unit-card';
import { groupRosterUnitsByRole } from '@/utils/roster';

interface RosterUnitsListProps {
  units: depot.RosterUnit[];
  onRemoveUnit: (unitId: string) => void;
  onDuplicateUnit: (unit: depot.RosterUnit) => void;
  onUpdateUnitWargear?: (unitId: string, wargear: depot.Wargear[]) => void;
}

const RosterUnitsList: React.FC<RosterUnitsListProps> = ({
  units,
  onRemoveUnit,
  onDuplicateUnit,
  onUpdateUnitWargear
}) => {
  const groupedUnits = useMemo(() => groupRosterUnitsByRole(units), [units]);
  const sortedRoleKeys = useMemo(() => Object.keys(groupedUnits).sort(), [groupedUnits]);

  if (units.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <div className="flex flex-col gap-2">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No units added yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Use the "Add Unit" panel to start building your roster
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Units ({units.length})
      </h3>

      <div className="flex flex-col gap-4">
        {sortedRoleKeys.map((role) => (
          <CollapsibleSection
            key={role}
            title={`${role.toUpperCase()} (${groupedUnits[role].length})`}
            defaultExpanded={true}
            className="border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex flex-col gap-3">
              {groupedUnits[role].map((unit) => (
                <RosterUnitCard
                  key={unit.id}
                  unit={unit}
                  onRemove={onRemoveUnit}
                  onDuplicate={onDuplicateUnit}
                  onUpdateWargear={onUpdateUnitWargear}
                />
              ))}
            </div>
          </CollapsibleSection>
        ))}
      </div>
    </div>
  );
};

export default RosterUnitsList;
