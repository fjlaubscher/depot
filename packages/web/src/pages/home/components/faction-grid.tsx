import React from 'react';
import type { depot } from '@depot/core';
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
        <LinkCard key={faction.slug} to={`/faction/${faction.slug}`}>
          {faction.name}
        </LinkCard>
      ))}
    </Grid>
  );
};

export default FactionGrid;
