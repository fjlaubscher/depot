import React, { useMemo } from 'react';
import type { depot } from '@depot/core';
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import classNames from 'classnames';

import {
  COLLECTION_STATE_META,
  COLLECTION_UNIT_STATES,
  getCollectionStateCounts
} from '@/utils/collection';

type CollectionStateChartProps = {
  items: depot.CollectionUnit[];
  className?: string;
  heading?: string;
  subheading?: string;
};

type ChartDatum = {
  key: depot.CollectionUnitState;
  label: string;
  value: number;
  color: string;
  percent: number;
};

const STATE_COLORS: Record<depot.CollectionUnitState, string> = {
  sprue: 'var(--color-red-500)',
  built: 'var(--color-amber-400)',
  'battle-ready': 'var(--color-emerald-500)',
  'parade-ready': 'var(--color-purple-500)'
};

const CollectionStateChart: React.FC<CollectionStateChartProps> = ({
  items,
  className,
  heading,
  subheading
}) => {
  const totals = useMemo(() => getCollectionStateCounts(items), [items]);
  const totalUnits = items.length;

  const chartData = useMemo<ChartDatum[]>(() => {
    return COLLECTION_UNIT_STATES.map((state) => {
      const value = totals[state] ?? 0;
      const percent = totalUnits > 0 ? Math.round((value / totalUnits) * 100) : 0;
      return {
        key: state,
        label: COLLECTION_STATE_META[state].label,
        value,
        color: STATE_COLORS[state],
        percent
      };
    });
  }, [totals, totalUnits]);

  const hasData = totalUnits > 0 && chartData.some((d) => d.value > 0);

  return (
    <div
      className={classNames(
        'flex flex-col gap-4 rounded-xl border border-subtle bg-white/5 p-4 shadow-sm dark:bg-gray-800/80 md:p-6 md:gap-6',
        className
      )}
    >
      {(heading || subheading) && (
        <div className="flex flex-col items-center gap-1 text-center">
          {heading ? <div className="text-sm font-semibold text-foreground">{heading}</div> : null}
          {subheading ? <div className="text-xs text-subtle">{subheading}</div> : null}
        </div>
      )}

      {hasData ? (
        <div className="h-64 w-full md:h-72">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              barGap={4}
              barSize={32}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: 'var(--color-gray-300)', fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={70}
                tick={{ fill: 'var(--color-gray-300)', fontSize: 12 }}
              />
              <Bar dataKey="percent" radius={[0, 8, 8, 0]} isAnimationActive={false}>
                {chartData.map((entry) => (
                  <Cell key={`bar-${entry.key}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
