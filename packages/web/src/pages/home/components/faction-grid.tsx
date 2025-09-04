import React from 'react';
import { depot } from '@depot/core';
import { Grid, SkeletonCard, LinkCard } from '@/components/ui';

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
        <LinkCard key={faction.id} to={`/faction/${faction.id}`}>
          {faction.name}
        </LinkCard>
      ))}
    </Grid>
  );
};

export default FactionGrid;
