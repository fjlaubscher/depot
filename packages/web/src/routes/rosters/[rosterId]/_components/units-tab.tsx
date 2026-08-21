import React, { useMemo } from 'react';
import type { depot } from '@depot/core';
import { validateRoster } from '@depot/core/utils/roster-legality';
import { RosterEmptyState, RosterSection } from '@/components/shared';
import ViewRosterUnitCard from './view-roster-unit-card';

interface UnitsTabProps {
  roster: depot.Roster;
}

const UnitsTab: React.FC<UnitsTabProps> = ({ roster }) => {
  const { units } = roster;

  const sortedUnits = useMemo(
    () => [...units].sort((a, b) => a.datasheet.name.localeCompare(b.datasheet.name)),
    [units]
  );

  // Legality issues carry an optional unitId — surface those on the unit itself
  // rather than only in the roster-level summary.
  const issuesByUnit = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const issue of validateRoster(roster)) {
      if (!issue.unitId) continue;
      map.set(issue.unitId, [...(map.get(issue.unitId) ?? []), issue.message]);
    }
    return map;
  }, [roster]);

  const enhancementsByUnit = useMemo(
    () => new Map(roster.enhancements.map((entry) => [entry.unitId, entry.enhancement.name])),
    [roster.enhancements]
  );

  if (units.length === 0) {
    return <RosterEmptyState title="No units in this roster" dataTestId="empty-roster-message" />;
  }

  return (
    <div className="flex flex-col gap-4" data-testid="units-tab">
      <RosterSection title={`Units (${sortedUnits.length})`}>
        <div className="flex flex-col gap-4">
          {sortedUnits.map((unit) => (
            <ViewRosterUnitCard
              key={unit.id}
              unit={unit}
              isWarlord={roster.warlordUnitId === unit.id}
              enhancementName={enhancementsByUnit.get(unit.id)}
              issues={issuesByUnit.get(unit.id)}
            />
          ))}
        </div>
      </RosterSection>
    </div>
  );
};

export default UnitsTab;
