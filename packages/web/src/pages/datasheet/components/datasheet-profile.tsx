import React, { useMemo } from 'react';
import { depot } from '@depot/core';

// components
import DatasheetHero from './datasheet-hero';
import DatasheetWargear from './datasheet-wargear';
import DatasheetAbilities from './datasheet-abilities';
import UnitDetails from './unit-details';

// utils
import { sortByName } from '@/utils/array';

interface DatasheetProfileProps {
  datasheet: depot.Datasheet;
  cost?: depot.ModelCost;
  alternateCost?: depot.ModelCost;
}

const DatasheetProfile: React.FC<DatasheetProfileProps> = ({ datasheet, cost, alternateCost }) => {
  const { abilities, unitComposition, models, options: datasheetOptions } = datasheet;

  const sortedAbilities = useMemo(() => sortByName(abilities) as depot.Ability[], [abilities]);
  const options = useMemo(() => datasheetOptions.filter((o) => o.description), [datasheetOptions]);

  return (
    <div className="flex flex-col gap-8" data-testid="datasheet-profile">
      <DatasheetHero datasheet={datasheet} cost={cost} alternateCost={alternateCost} />
      <DatasheetWargear datasheet={datasheet} />
      <DatasheetAbilities abilities={sortedAbilities} />
      <UnitDetails unitComposition={unitComposition} options={options} models={models} />
    </div>
  );
};

export default DatasheetProfile;
