import React from 'react';
import type { depot } from '@depot/core';

import { COLLECTION_UNIT_STATES, getCollectionStateCounts } from '@depot/core/utils/collection';
import { COLLECTION_STATE_META } from '@/utils/collection';

type CollectionStateChartProps = {
  items: depot.CollectionUnit[];
  heading?: string;
  subheading?: string;
};

const STATE_COLORS: Record<depot.CollectionUnitState, string> = {
  sprue: 'var(--color-red-500)',
  built: 'var(--color-amber-400)',
  'battle-ready': 'var(--color-emerald-500)',
  'parade-ready': 'var(--color-purple-500)'
};

const CollectionStateChart: React.FC<CollectionStateChartProps> = ({
  items,
  heading,
  subheading
}) => {
  const totals = getCollectionStateCounts(items);
  const totalUnits = items.length;
  const chartData = COLLECTION_UNIT_STATES.map((state) => ({
    key: state,
    label: COLLECTION_STATE_META[state].label,
    color: STATE_COLORS[state],
    percent: totalUnits > 0 ? Math.round((totals[state] / totalUnits) * 100) : 0
  }));

  return (
    <div className="flex flex-col gap-4 rounded-sm border border-border-subtle bg-surface-card p-4 shadow-e1 md:p-6 md:gap-6">
      {(heading || subheading) && (
        <div className="flex flex-col items-center gap-1 text-center">
          {heading ? <div className="text-sm font-semibold text-foreground">{heading}</div> : null}
          {subheading ? <div className="text-xs text-subtle">{subheading}</div> : null}
        </div>
      )}

      {totalUnits > 0 ? (
        <div className="flex h-64 w-full flex-col justify-around md:h-72">
          {chartData.map((entry) => (
            <div key={`bar-${entry.key}`} className="flex items-center gap-2">
              <span
                className="w-[70px] shrink-0 text-xs"
                style={{ color: 'var(--color-gray-300)' }}
              >
                {entry.label}
              </span>
              <div className="h-8 flex-1">
                <div
                  className="h-full rounded-r-sm"
                  style={{ width: `${entry.percent}%`, backgroundColor: entry.color }}
                />
              </div>
              <span
                className="w-10 shrink-0 text-right text-xs"
                style={{ color: 'var(--color-gray-300)' }}
              >
                {entry.percent}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center text-sm text-subtle">
          Add units to see a build-state breakdown.
        </div>
      )}
    </div>
  );
};

export default CollectionStateChart;
