import React from 'react';
import { depot } from 'depot-core';
import { Grid, SkeletonCard } from '@/components/ui';
import FactionCard from './faction-card';

interface FactionGridProps {
  factions: depot.Index[];
  loading?: boolean;
}

const FactionGrid: React.FC<FactionGridProps> = ({ factions, loading = false }) => {
  if (loading) {
    return (
      <Grid>
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))}
      </Grid>
    );
  }

  return (
    <Grid>
      {factions.map((faction) => (
        <FactionCard key={faction.id} faction={faction} />
      ))}
    </Grid>
  );
};

export default FactionGrid;