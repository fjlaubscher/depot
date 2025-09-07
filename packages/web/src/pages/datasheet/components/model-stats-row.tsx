import React from 'react';
import { depot } from '@depot/core';

import { StatCard, StatsRow } from '@/components/ui';

interface ModelStatsRowProps {
  model: depot.Model;
}

const ModelStatsRow: React.FC<ModelStatsRowProps> = ({ model }) => {
  return (
    <StatsRow title={model.name} subtitle={model.baseSize}>
      <StatCard label="M" value={model.m} />
      <StatCard label="T" value={model.t} />
      <StatCard label="Sv" value={model.sv} />
      <StatCard label="W" value={model.w} />
      <StatCard label="Ld" value={model.ld} />
      <StatCard label="OC" value={model.oc} />
    </StatsRow>
  );
};

export default ModelStatsRow;
