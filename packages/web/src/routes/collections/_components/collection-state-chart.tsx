import React from 'react';
import type { depot } from '@depot/core';

import { COLLECTION_UNIT_STATES, getCollectionStateCounts } from '@depot/core/utils/collection';
import { COLLECTION_STATE_META } from '@/utils/collection';

type CollectionStateChartProps = {
  items: depot.CollectionUnit[];
  heading?: string;
};

const CollectionStateChart: React.FC<CollectionStateChartProps> = ({ items, heading }) => {
  const totals = getCollectionStateCounts(items);
  const totalUnits = items.length;

  return (
    <div className="surface-card flex flex-col gap-2 p-3">
      {heading ? (
        <div className="text-[13.5px] leading-tight font-bold text-foreground">{heading}</div>
      ) : null}

      {totalUnits > 0 ? (
        <div className="flex flex-col gap-1">
          {COLLECTION_UNIT_STATES.map((state) => {
            const { label, bar } = COLLECTION_STATE_META[state];
            const percent = Math.round((totals[state] / totalUnits) * 100);

            return (
              <div key={`bar-${state}`} className="flex items-center gap-2">
                <span className="w-[86px] shrink-0 font-mono text-[9.5px] font-medium uppercase text-muted">
                  {label}
                </span>
                {/* The track keeps every row the same length, so an empty state still reads as zero. */}
                <div className="h-2 flex-1 overflow-hidden rounded-xs bg-surface-soft">
                  <div className={`h-full ${bar}`} style={{ width: `${percent}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right font-mono text-[10px] font-bold text-body tabular-nums">
                  {percent}%
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-subtle">
          Add units to see a build-state breakdown.
        </p>
      )}
    </div>
  );
};

export default CollectionStateChart;
