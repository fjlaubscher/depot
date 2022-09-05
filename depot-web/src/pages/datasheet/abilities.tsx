import React, { useMemo } from 'react';

// components
import Card from '../../components/card';
import Grid from '../../components/grid';

// utils
import { sortByName } from '../../utils/array';

interface Props {
  abilities: depot.Ability[];
}

const DatasheetAbilities: React.FC<Props> = ({ abilities }) => {
  const sortedAbilities = useMemo(() => sortByName(abilities) as depot.Ability[], [abilities]);
  return (
    <Grid>
      {sortedAbilities.map((ability) => (
        <Card key={ability.id} title={ability.name}>
          <p>{ability.description}</p>
        </Card>
      ))}
    </Grid>
  );
};

export default DatasheetAbilities;
