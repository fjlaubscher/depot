import type { depot } from '@depot/core';
import { getDefaultWargearSelection, normalizeDatasheetWargear } from '@/utils/wargear';

type TagVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export const getCollectionLabels = (usePileLabel: boolean) => ({
  pluralTitle: usePileLabel ? 'Pile of Shame' : 'Collections',
  singularTitle: usePileLabel ? 'Pile of Shame' : 'Collection',
  singular: usePileLabel ? 'pile of shame' : 'collection',
  short: usePileLabel ? 'pile' : 'collection'
});

export const COLLECTION_UNIT_STATES: depot.CollectionUnitState[] = [
  'sprue',
  'built',
  'battle-ready',
  'parade-ready'
];

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

const createEmptyStateCounts = (): Record<depot.CollectionUnitState, number> => ({
  sprue: 0,
  built: 0,
  'battle-ready': 0,
  'parade-ready': 0
});

export const getCollectionStateCounts = (
  items: depot.CollectionUnit[]
): Record<depot.CollectionUnitState, number> => {
  return items.reduce<Record<depot.CollectionUnitState, number>>((acc, item) => {
    acc[item.state] = (acc[item.state] ?? 0) + 1;
    return acc;
  }, createEmptyStateCounts());
};

export const calculateCollectionPoints = (collection: depot.Collection): number => {
  return collection.items.reduce(
    (total, item) => total + (parseInt(item.modelCost.cost, 10) || 0),
    0
  );
};

export const createCollectionUnitFromDatasheet = (
  datasheet: depot.Datasheet,
  modelCost: depot.ModelCost
): depot.CollectionUnit => {
  const normalized = normalizeDatasheetWargear(datasheet);
  return {
    id: crypto.randomUUID(),
    datasheet: normalized,
    modelCost,
    selectedWargear: getDefaultWargearSelection(normalized),
    selectedWargearAbilities: [],
    state: 'sprue',
    datasheetSlug: normalized.slug
  };
};

export const getCollectionChartCopy = (
  collection: depot.Collection,
  points: number
): { heading: string; subheading?: string; totalUnits: number } => {
  const totalUnits = collection.items.length;
  const stateCounts = getCollectionStateCounts(collection.items);
  const dominantState =
    totalUnits > 0
      ? COLLECTION_UNIT_STATES.reduce((prev, curr) =>
          (stateCounts[curr] ?? 0) >= (stateCounts[prev] ?? 0) ? curr : prev
        )
      : undefined;

  const heading =
    totalUnits > 0 ? `${totalUnits} unit${totalUnits === 1 ? '' : 's'}` : 'No units yet';

  const subheading =
    totalUnits > 0 && dominantState
      ? COLLECTION_STATE_BLURBS[dominantState]
      : 'Add units to see how your kits are progressing.';

  return {
    heading,
    subheading,
    totalUnits
  };
};

export const getCollectionsSnapshotCopy = (
  collections: depot.Collection[],
  usePileLabel: boolean
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
  const dominantState =
    totalUnits > 0
      ? COLLECTION_UNIT_STATES.reduce((prev, curr) =>
          (stateCounts[curr] ?? 0) > (stateCounts[prev] ?? 0) ? curr : prev
        )
      : undefined;

  const heading =
    totalUnits > 0
      ? `${totalUnits} unit${totalUnits === 1 ? '' : 's'} across ${collections.length} collection${
          collections.length === 1 ? '' : 's'
        }`
      : usePileLabel
        ? 'Start your pile of shame'
        : 'Start your collection';

  const subheading =
    totalUnits > 0 && dominantState
      ? COLLECTION_STATE_BLURBS[dominantState]
      : 'Add a collection to see how your kits are progressing.';

  return { heading, subheading, items, stateCounts, totalUnits, dominantState };
};
