import type { depot } from '@depot/core';
import { getDefaultWargearSelection, normalizeDatasheetWargear } from '@/utils/wargear';

export const COLLECTION_UNIT_STATES: depot.CollectionUnitState[] = [
  'built',
  'battle ready',
  'parade ready'
];

export const calculateCollectionPoints = (collection: depot.Collection): number => {
  return collection.items.reduce((total, item) => total + (parseInt(item.modelCost.cost, 10) || 0), 0);
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
    state: 'built',
    datasheetSlug: normalized.slug
  };
};
