import React, { useMemo } from 'react';
import type { depot } from '@depot/core';

// components
import DatasheetHero from './datasheet-hero';
import DatasheetWargear from './datasheet-wargear';
import DatasheetLeaderRules from './datasheet-leader-rules';
import { DatasheetAbilities } from '@/components/shared/datasheet';

// utils
import { categorizeAbilities } from '@/utils/abilities';

interface DatasheetProfileProps {
  datasheet: depot.Datasheet;
  factionDatasheets: depot.Datasheet[];
}

const DatasheetProfile: React.FC<DatasheetProfileProps> = ({ datasheet, factionDatasheets }) => {
  const { inline: inlineAbilities, referenced: coreAbilities } = useMemo(() => {
    return categorizeAbilities(datasheet.abilities);
  }, [datasheet.abilities]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2" data-testid="datasheet-profile">
        <DatasheetHero datasheet={datasheet} />
        <DatasheetLeaderRules datasheet={datasheet} factionDatasheets={factionDatasheets} />
        <DatasheetAbilities
          title="Core Abilities"
          abilities={coreAbilities}
          dataTestId="core-abilities"
        />
        <DatasheetAbilities
          title="Unit Abilities"
          abilities={inlineAbilities}
          dataTestId="unit-abilities"
        />
      </div>
      <DatasheetWargear datasheet={datasheet} />
    </div>
  );
};

export default DatasheetProfile;
