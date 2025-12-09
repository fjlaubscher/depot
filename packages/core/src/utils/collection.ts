import type {
  Collection,
  CollectionUnit,
  CollectionUnitState,
  Datasheet,
  ModelCost
} from '../types/depot.js';
import { getDefaultWargearSelection, normalizeDatasheetWargear } from './wargear.js';

const randomId = () => {
  const cryptoObj = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }
  return `collection-unit-${Math.random().toString(36).slice(2)}`;
};

export const COLLECTION_UNIT_STATES: CollectionUnitState[] = [
  'sprue',
  'built',
  'battle-ready',
  'parade-ready'
];

export type CollectionStateCounts = Record<CollectionUnitState, number>;

const createEmptyStateCounts = (): CollectionStateCounts => ({
  sprue: 0,
  built: 0,
  'battle-ready': 0,
  'parade-ready': 0
});

export const getCollectionStateCounts = (items: CollectionUnit[]): CollectionStateCounts => {
  return items.reduce<CollectionStateCounts>((acc, item) => {
    acc[item.state] = (acc[item.state] ?? 0) + 1;
    return acc;
  }, createEmptyStateCounts());
};

export const calculateCollectionPoints = (collection: Collection): number => {
  return collection.items.reduce(
    (total, item) => total + (parseInt(item.modelCost.cost, 10) || 0),
    0
  );
};

export const createCollectionUnitFromDatasheet = (
  datasheet: Datasheet,
  modelCost: ModelCost
): CollectionUnit => {
  const normalized = normalizeDatasheetWargear(datasheet);
  return {
    id: randomId(),
    datasheet: normalized,
    modelCost,
    selectedWargear: getDefaultWargearSelection(normalized),
    selectedWargearAbilities: [],
    state: 'sprue',
    datasheetSlug: normalized.slug
  };
};
