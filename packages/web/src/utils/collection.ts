import type { depot } from '@depot/core';
import i18n from '@/i18n';

type TagVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** `bar` sits beside `variant` so a state reads the same on a tag and in the chart. */
export const COLLECTION_STATE_META: Record<
  depot.CollectionUnitState,
  { labelKey: `states.${depot.CollectionUnitState}`; variant: TagVariant; bar: string }
> = {
  sprue: { labelKey: 'states.sprue', variant: 'danger', bar: 'bg-danger-fg' },
  built: { labelKey: 'states.built', variant: 'warning', bar: 'bg-warning-fg' },
  'battle-ready': { labelKey: 'states.battle-ready', variant: 'success', bar: 'bg-success-fg' },
  'parade-ready': { labelKey: 'states.parade-ready', variant: 'secondary', bar: 'bg-info-fg' }
};

export const getCollectionChartCopy = (
  collection: depot.Collection,
  points: number
): { heading: string; totalUnits: number } => {
  const totalUnits = collection.items.length;

  return {
    heading: i18n.t(totalUnits > 0 ? 'chart.count' : 'chart.noUnits', {
      ns: 'collections',
      count: totalUnits
    }),
    totalUnits
  };
};

export const getCollectionsSnapshotCopy = (
  collections: depot.Collection[]
): { heading: string; items: depot.CollectionUnit[]; totalUnits: number } => {
  const items = collections.flatMap((c) => c.items ?? []);
  const totalUnits = items.length;

  const heading =
    totalUnits > 0
      ? i18n.t(collections.length === 1 ? 'chart.snapshotSingle' : 'chart.snapshotMultiple', {
          ns: 'collections',
          count: totalUnits,
          collections: collections.length
        })
      : i18n.t('chart.start', { ns: 'collections' });

  return { heading, items, totalUnits };
};

const READY_STATES: depot.CollectionUnitState[] = ['battle-ready', 'parade-ready'];

/** Share of units painted to at least battle-ready, 0–100. */
export const getReadyPercent = (items: depot.CollectionUnit[]): number =>
  items.length === 0
    ? 0
    : Math.round((items.filter((i) => READY_STATES.includes(i.state)).length / items.length) * 100);
