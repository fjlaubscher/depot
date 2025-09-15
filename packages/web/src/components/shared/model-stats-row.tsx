import React from 'react';
import { depot } from '@depot/core';

import { StatCard, StatsRow } from '@/components/ui';

interface ModelStatsRowProps {
  model: depot.Model;
  variant?: 'default' | 'compact';
}

const ModelStatsRow: React.FC<ModelStatsRowProps> = ({ model, variant = 'default' }) => {
  const statCardSize = variant === 'compact' ? 'compact' : 'default';

  return (
    <StatsRow title={model.name} subtitle={model.baseSize} variant={variant}>
      <StatCard label="M" value={model.m} size={statCardSize} />
      <StatCard label="T" value={model.t} size={statCardSize} />
      <StatCard label="Sv" value={model.sv} size={statCardSize} />
      <StatCard label="W" value={model.w} size={statCardSize} />
      <StatCard label="Ld" value={model.ld} size={statCardSize} />
      <StatCard label="OC" value={model.oc} size={statCardSize} />
    </StatsRow>
  );
};

export default ModelStatsRow;
