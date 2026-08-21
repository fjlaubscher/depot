import React, { useMemo } from 'react';
import type { depot } from '@depot/core';
import type { DatasheetListItem } from '@depot/core/utils/datasheets';

// components
import DatasheetHero from './datasheet-hero';
import DatasheetWargear from './datasheet-wargear';
import DatasheetLeaderRules from './datasheet-leader-rules';
import { ModelStatsRow } from '@/components/shared';
import { DatasheetAbilities } from '@/components/shared/datasheet';
import { categorizeAbilities } from '@depot/core/utils/abilities';

interface DatasheetProfileProps {
  datasheet: depot.Datasheet;
  factionDatasheets?: DatasheetListItem[];
}

const DatasheetProfile: React.FC<DatasheetProfileProps> = ({
  datasheet,
  factionDatasheets = []
}) => {
  const mergedAbilities = useMemo(() => {
    const { inline, referenced } = categorizeAbilities(datasheet.abilities);
    return [...referenced, ...inline];
  }, [datasheet.abilities]);

  return (
    <div className="flex flex-col gap-2 sm:gap-4" data-testid="datasheet-profile">
      {/* Model Stats Rows */}
      {datasheet.models.map((model) => (
        <ModelStatsRow key={model.line} model={model} />
      ))}

      <DatasheetHero datasheet={datasheet} />

      <DatasheetAbilities
        title="Abilities"
        abilities={mergedAbilities}
        dataTestId="datasheet-abilities"
      />

      <DatasheetLeaderRules datasheet={datasheet} factionDatasheets={factionDatasheets} />

      <DatasheetWargear datasheet={datasheet} />
    </div>
  );
};

export default DatasheetProfile;
