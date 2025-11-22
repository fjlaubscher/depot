import type { depot } from '@depot/core';
import { getDefaultWargearSelection, normalizeDatasheetWargear } from '@/utils/wargear';

type TagVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

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
  sprue: { label: 'Sprue', variant: 'warning' },
  built: { label: 'Built', variant: 'secondary' },
  'battle-ready': { label: 'Battle Ready', variant: 'primary' },
  'parade-ready': { label: 'Parade Ready', variant: 'success' }
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
