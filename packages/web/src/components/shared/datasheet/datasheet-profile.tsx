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
      {/* Stat block stays full width — it reads best uninterrupted */}
      {datasheet.models.map((model) => (
        <ModelStatsRow key={model.line} model={model} />
      ))}

      {/* Desktop splits the body: wargear tables left, rules and keywords pinned right */}
      <div className="flex flex-col gap-2 sm:gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-2 sm:gap-4">
          <DatasheetWargear datasheet={datasheet} />
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:gap-4 lg:sticky lg:top-4">
          <DatasheetHero datasheet={datasheet} />

          <DatasheetAbilities
            title="Abilities"
            abilities={mergedAbilities}
            dataTestId="datasheet-abilities"
          />

          <DatasheetLeaderRules datasheet={datasheet} factionDatasheets={factionDatasheets} />
        </div>
      </div>
    </div>
  );
};

export default DatasheetProfile;
