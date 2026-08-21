import React from 'react';
import type { depot } from '@depot/core';
import { Grid } from '@/components/ui';
import FactionCard from './faction-card';

interface FactionGridProps {
  factions: depot.Index[];
}

const FactionGrid: React.FC<FactionGridProps> = ({ factions }) => (
  <Grid>
    {factions.map((faction) => (
      <FactionCard key={faction.slug} faction={faction} />
    ))}
  </Grid>
);

export default FactionGrid;
