import type { depot } from '@depot/core';

type UnknownRecord = Record<string, unknown>;

/** Wahapedia edition path the export was built against (e.g. wh40k10ed). */
export type GameEdition = string;

export interface ExportedRoster {
  kind: 'roster';
  version: 1;
  dataVersion: string | null;
  /** Optional; missing means legacy 10th-era export. */
  edition?: GameEdition;
  roster: depot.Roster;
}

export interface ExportedCollection {
  kind: 'collection';
  version: 1;
  dataVersion: string | null;
  /** Optional; missing means legacy 10th-era export. */
  edition?: GameEdition;
  collection: depot.Collection;
}

/** Current catalog edition shipped by depot (mirrors CLI WAHAPEDIA_EDITION default). */
export const CURRENT_GAME_EDITION = 'wh40k10ed';

const isObject = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

const hasRosterShape = (value: unknown): value is depot.Roster => {
  if (!isObject(value)) return false;
  const points = (value as UnknownRecord).points;
  const detachment = (value as UnknownRecord).detachment;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.factionId === 'string' &&
    Array.isArray(value.units) &&
    Array.isArray(value.enhancements) &&
    isObject(detachment) &&
    isObject(points) &&
    typeof points.current === 'number' &&
    typeof points.max === 'number'
  );
};

const hasCollectionShape = (value: unknown): value is depot.Collection => {
  if (!isObject(value)) return false;
  const points = (value as UnknownRecord).points;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.factionId === 'string' &&
    Array.isArray(value.items) &&
    isObject(points) &&
    typeof points.current === 'number'
  );
};

export const isExportedRoster = (value: unknown): value is ExportedRoster => {
  if (!isObject(value)) return false;
  const { kind, version, roster } = value as Partial<ExportedRoster>;
  return kind === 'roster' && version === 1 && hasRosterShape(roster);
};

export const isExportedCollection = (value: unknown): value is ExportedCollection => {
  if (!isObject(value)) return false;
  const { kind, version, collection } = value as Partial<ExportedCollection>;
  return kind === 'collection' && version === 1 && hasCollectionShape(collection);
};
