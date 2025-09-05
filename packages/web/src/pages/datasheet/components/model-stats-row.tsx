import React from 'react';
import { depot } from '@depot/core';

import StatCard from './stat-card';

interface ModelStatsRowProps {
  model: depot.Model;
}

const ModelStatsRow: React.FC<ModelStatsRowProps> = ({ model }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
        {model.name}
        {model.baseSize && (
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">[{model.baseSize}]</span>
        )}
      </div>
      <div className="flex gap-2">
        <StatCard label="M" value={model.m} />
        <StatCard label="T" value={model.t} />
        <StatCard label="Sv" value={model.sv} />
        <StatCard label="W" value={model.w} />
        <StatCard label="Ld" value={model.ld} />
        <StatCard label="OC" value={model.oc} />
      </div>
    </div>
  );
};

export default ModelStatsRow;
