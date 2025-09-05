import React from 'react';
import { depot } from '@depot/core';

import StatCard from './stat-card';

interface WargearStatsRow {
  wargear: depot.Wargear;
  type: 'ranged' | 'melee';
}

const WargearStatsRow: React.FC<WargearStatsRow> = ({ wargear, type }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
        {wargear.name}
        {wargear.description && (
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            [{wargear.description}]
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {type === 'ranged' ? <StatCard label="Range" value={`${wargear.range}"`} /> : null}
        <StatCard label="A" value={wargear.a} />
        <StatCard
          label={type === 'ranged' ? 'BS' : 'WS'}
          value={wargear.bsWs === 'N/A' ? wargear.bsWs : `${wargear.bsWs}+`}
        />
        <StatCard label="S" value={wargear.s} />
        <StatCard label="AP" value={wargear.ap} />
        <StatCard label="D" value={wargear.d} />
      </div>
    </div>
  );
};

export default WargearStatsRow;
