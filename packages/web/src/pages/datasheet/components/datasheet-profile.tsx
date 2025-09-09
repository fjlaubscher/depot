import React, { useMemo } from 'react';
import { depot } from '@depot/core';

// components
import DatasheetHero from './datasheet-hero';
import DatasheetWargear from './datasheet-wargear';
import DatasheetInlineAbilities from './datasheet-inline-abilities';
import UnitDetails from './unit-details';

// utils
import { categorizeAbilities } from '../utils/abilities';

interface DatasheetProfileProps {
  datasheet: depot.Datasheet;
}

const DatasheetProfile: React.FC<DatasheetProfileProps> = ({ datasheet }) => {
  // Extract only inline abilities for this tab
  const inlineAbilities = useMemo(() => {
    const { inline } = categorizeAbilities(datasheet.abilities);
    return inline;
  }, [datasheet.abilities]);

  return (
    <div className="flex flex-col gap-4" data-testid="datasheet-profile">
      <DatasheetHero datasheet={datasheet} />
      <DatasheetWargear datasheet={datasheet} />
      <DatasheetInlineAbilities abilities={inlineAbilities} />
      <UnitDetails datasheet={datasheet} />
    </div>
  );
};

export default DatasheetProfile;
