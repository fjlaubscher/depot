import React, { useMemo } from 'react';
import type { depot } from '@depot/core';
import type { DatasheetListItem } from '@/types/datasheets';

// components
import DatasheetHero from './datasheet-hero';
import DatasheetWargear from './datasheet-wargear';
import { ModelStatsRow } from '@/components/shared';
import { DatasheetAbilities } from '@/components/shared/datasheet';

// utils
import { categorizeAbilities } from '@/utils/abilities';

interface DatasheetProfileProps {
  datasheet: depot.Datasheet;
  factionDatasheets?: DatasheetListItem[];
  abilitiesTestId?: string;
}

const DatasheetProfile: React.FC<DatasheetProfileProps> = ({
  datasheet,
  factionDatasheets = [],
  abilitiesTestId = 'datasheet-abilities'
}) => {
  const { inline: inlineAbilities, referenced: coreAbilities } = useMemo(() => {
    return categorizeAbilities(datasheet.abilities);
  }, [datasheet.abilities]);

  const mergedAbilities = useMemo(
    () => [...coreAbilities, ...inlineAbilities],
    [coreAbilities, inlineAbilities]
  );

  return (
    <div className="flex flex-col gap-2 sm:gap-4" data-testid="datasheet-profile">
      {/* Model Stats Rows */}
      {datasheet.models.map((model) => (
        <ModelStatsRow key={model.line} model={model} />
      ))}
      <DatasheetHero datasheet={datasheet} factionDatasheets={factionDatasheets} />
      <DatasheetAbilities
        title="Abilities"
        abilities={mergedAbilities}
        dataTestId={abilitiesTestId}
      />
      <DatasheetWargear datasheet={datasheet} />
    </div>
  );
};

export default DatasheetProfile;
