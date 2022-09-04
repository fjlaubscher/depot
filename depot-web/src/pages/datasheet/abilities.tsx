import React from 'react';

// components
import Card from '../../components/card';
import Grid from '../../components/grid';

interface Props {
  abilities: depot.Ability[];
}

const DatasheetAbilities: React.FC<Props> = ({ abilities }) => (
  <Grid>
    {abilities.map((ability) => (
      <Card key={ability.id} title={ability.name}>
        <p>{ability.description}</p>
      </Card>
    ))}
  </Grid>
);

export default DatasheetAbilities;
