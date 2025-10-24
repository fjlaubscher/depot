import React, { useMemo } from 'react';
import type { depot } from '@depot/core';
import DetachmentAbilityCard from '@/routes/factions/[factionSlug]/_components/detachment-ability-card';
import EnhancementCard from '@/routes/factions/[factionSlug]/_components/enhancement-card';
import StratagemCard from '@/components/shared/stratagem-card';
import { sortByName } from '@/utils/array';

interface DetachmentTabProps {
  detachment: depot.Detachment;
  rosterEnhancements: depot.Roster['enhancements'];
  units: depot.RosterUnit[];
}

const DetachmentTab: React.FC<DetachmentTabProps> = ({ detachment, rosterEnhancements, units }) => {
  const { name, abilities, stratagems } = detachment;

  const sortedAbilities = useMemo(() => sortByName(abilities), [abilities]);
  const sortedStratagems = useMemo(() => sortByName(stratagems), [stratagems]);

  const unitLookup = useMemo(() => {
    return units.reduce<Record<string, depot.RosterUnit>>((acc, unit) => {
      acc[unit.id] = unit;
      return acc;
    }, {});
  }, [units]);

  const selectedEnhancements = useMemo(() => {
    return rosterEnhancements
      .map(({ enhancement, unitId }) => ({
        enhancement,
        unitId,
        unitName: unitLookup[unitId]?.datasheet.name ?? ''
      }))
      .sort((a, b) => a.enhancement.name.localeCompare(b.enhancement.name));
  }, [rosterEnhancements, unitLookup]);

  const renderEmpty = (label: string) => (
    <p className="text-sm text-gray-500 dark:text-gray-400">
      No {label} available for this detachment.
    </p>
  );

  return (
    <div className="flex flex-col gap-4" data-testid="detachment-overview">
      <section className="flex flex-col gap-2" data-testid="detachment-abilities-section">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
          Detachment Abilities
        </h3>
        {sortedAbilities.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedAbilities.map((ability) => (
              <DetachmentAbilityCard key={ability.id || ability.name} ability={ability} />
            ))}
          </div>
        ) : (
          renderEmpty('abilities')
        )}
      </section>

      {selectedEnhancements.length > 0 ? (
        <section className="flex flex-col gap-2" data-testid="detachment-enhancements-section">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
            Selected Enhancements
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {selectedEnhancements.map(({ enhancement, unitName, unitId }) => (
              <div
                key={`${enhancement.id || enhancement.name}-${unitId}`}
                className="flex flex-col gap-2"
              >
                <EnhancementCard enhancement={enhancement} />
                {unitName ? (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Assigned to {unitName}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-2" data-testid="detachment-stratagems-section">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
          Stratagems
        </h3>
        {sortedStratagems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedStratagems.map((stratagem) => (
              <StratagemCard key={stratagem.id || stratagem.name} stratagem={stratagem} />
            ))}
          </div>
        ) : (
          renderEmpty('stratagems')
        )}
      </section>
    </div>
  );
};

export default DetachmentTab;
