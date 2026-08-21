import type { depot } from '@depot/core';
import { COLLECTION_UNIT_STATES, getCollectionStateCounts } from '@depot/core/utils/collection';

type TagVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

/** `bar` sits beside `variant` so a state reads the same on a tag and in the chart. */
export const COLLECTION_STATE_META: Record<
  depot.CollectionUnitState,
  { label: string; variant: TagVariant; bar: string }
> = {
  sprue: { label: 'Sprue', variant: 'danger', bar: 'bg-danger-fg' },
  built: { label: 'Assembled', variant: 'warning', bar: 'bg-warning-fg' },
  'battle-ready': { label: 'Battle Ready', variant: 'success', bar: 'bg-success-fg' },
  'parade-ready': { label: 'Parade Ready', variant: 'secondary', bar: 'bg-info-fg' }
};

export const getCollectionChartCopy = (
  collection: depot.Collection,
  points: number
): { heading: string; totalUnits: number } => {
  const totalUnits = collection.items.length;

  return {
    heading: totalUnits > 0 ? `${totalUnits} unit${totalUnits === 1 ? '' : 's'}` : 'No units yet',
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
      ? `${totalUnits} unit${totalUnits === 1 ? '' : 's'} across ${collections.length} collection${
          collections.length === 1 ? '' : 's'
        }`
      : 'Start your collection';

  return { heading, items, totalUnits };
};

const READY_STATES: depot.CollectionUnitState[] = ['battle-ready', 'parade-ready'];

/** Share of units painted to at least battle-ready, 0–100. */
export const getReadyPercent = (items: depot.CollectionUnit[]): number =>
  items.length === 0
    ? 0
    : Math.round((items.filter((i) => READY_STATES.includes(i.state)).length / items.length) * 100);
