import type { depot } from '@depot/core';
import { COLLECTION_UNIT_STATES, getCollectionStateCounts } from '@depot/core/utils/collection';

type TagVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export const COLLECTION_STATE_META: Record<
  depot.CollectionUnitState,
  { label: string; variant: TagVariant }
> = {
  sprue: { label: 'Sprue', variant: 'danger' },
  built: { label: 'Assembled', variant: 'warning' },
  'battle-ready': { label: 'Battle Ready', variant: 'success' },
  'parade-ready': { label: 'Parade Ready', variant: 'secondary' }
};

export const COLLECTION_STATE_BLURBS: Record<depot.CollectionUnitState, string> = {
  sprue: 'Mostly "Sprue" — time to get building.',
  built: 'Mostly "Assembled" — grab primer and paint.',
  'battle-ready': 'Mostly "Battle Ready" — add tufts and decals.',
  'parade-ready': 'Mostly "Parade Ready" — showtime (or start a new box).'
};

/** Most common unit state; ties go to the later state in COLLECTION_UNIT_STATES. */
const dominantState = (
  stateCounts: Record<depot.CollectionUnitState, number>
): depot.CollectionUnitState =>
  COLLECTION_UNIT_STATES.reduce((prev, curr) =>
    (stateCounts[curr] ?? 0) >= (stateCounts[prev] ?? 0) ? curr : prev
  );

export const getCollectionChartCopy = (
  collection: depot.Collection,
  points: number
): { heading: string; subheading?: string; totalUnits: number } => {
  const totalUnits = collection.items.length;
  const stateCounts = getCollectionStateCounts(collection.items);

  const heading =
    totalUnits > 0 ? `${totalUnits} unit${totalUnits === 1 ? '' : 's'}` : 'No units yet';

  const subheading =
    totalUnits > 0
      ? COLLECTION_STATE_BLURBS[dominantState(stateCounts)]
      : 'Add units to see how your kits are progressing.';

  return { heading, subheading, totalUnits };
};

export const getCollectionsSnapshotCopy = (
  collections: depot.Collection[]
): {
  heading: string;
  subheading: string;
  items: depot.CollectionUnit[];
  stateCounts: Record<depot.CollectionUnitState, number>;
  totalUnits: number;
  dominantState?: depot.CollectionUnitState;
} => {
  const items = collections.flatMap((c) => c.items ?? []);
  const stateCounts = getCollectionStateCounts(items);
  const totalUnits = items.length;
  const dominant = totalUnits > 0 ? dominantState(stateCounts) : undefined;

  const heading =
    totalUnits > 0
      ? `${totalUnits} unit${totalUnits === 1 ? '' : 's'} across ${collections.length} collection${
          collections.length === 1 ? '' : 's'
        }`
      : 'Start your collection';

  const subheading = dominant
    ? COLLECTION_STATE_BLURBS[dominant]
    : 'Add a collection to see how your kits are progressing.';

  return { heading, subheading, items, stateCounts, totalUnits, dominantState: dominant };
};
