import type { FC } from 'react';
import React, { useMemo } from 'react';
import type { depot } from '@depot/core';

import { ModelStatsRow } from '@/components/shared';
import DatasheetHero from '@/components/shared/datasheet/datasheet-hero';
import { DatasheetAbilities } from '@/components/shared/datasheet';
import { categorizeAbilities } from '@/utils/abilities';
import WargearTable from '@/components/shared/wargear-table';

interface RosterUnitProfileProps {
  unit: depot.RosterUnit;
  abilitiesTestId?: string;
}

const RosterUnitProfile: FC<RosterUnitProfileProps> = ({
  unit,
  abilitiesTestId = 'roster-unit-abilities'
}) => {
  const datasheet = unit.datasheet;

  const abilitiesForDisplay = useMemo(() => {
    const baseAbilities = datasheet.abilities.filter(
      (ability) => (ability.type ?? '').toLowerCase() !== 'wargear'
    );
    const wargearAbilities = unit.selectedWargearAbilities ?? [];

    return [...baseAbilities, ...wargearAbilities];
  }, [datasheet.abilities, unit.selectedWargearAbilities]);

  const { inline: inlineAbilities, referenced: coreAbilities } = useMemo(
    () => categorizeAbilities(abilitiesForDisplay),
    [abilitiesForDisplay]
  );

  const mergedAbilities = useMemo(
    () => [...coreAbilities, ...inlineAbilities],
    [coreAbilities, inlineAbilities]
  );

  const selectedWargear = unit.selectedWargear ?? [];

  return (
    <div className="flex flex-col gap-2" data-testid="roster-unit-profile">
      {datasheet.models.map((model) => (
        <ModelStatsRow key={model.line} model={model} variant="compact" />
      ))}

      <DatasheetHero
        datasheet={datasheet}
        factionDatasheets={[]}
        showPoints={false}
        compositionVariant="compact"
      />

      <DatasheetAbilities
        title="Abilities"
        abilities={mergedAbilities}
        dataTestId={abilitiesTestId}
      />

      {selectedWargear.length > 0 && (
        <div className="flex flex-col gap-2" data-testid="roster-unit-selected-wargear">
          <WargearTable wargear={selectedWargear} title="Selected Wargear" type="Mixed" />
        </div>
      )}
    </div>
  );
};

export default RosterUnitProfile;
