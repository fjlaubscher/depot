import type { ModelCost } from '../types/depot.js';
import type { DatasheetModelCost } from '../types/wahapedia.js';
import { groupBy } from './common.js';

const NUMERIC_COST = /^\d+$/;

export const hasNumericCost = (cost: string | undefined | null): boolean =>
  Boolean(cost && NUMERIC_COST.test(cost.trim()));

export const selectableModelCosts = <T extends { cost: string }>(costs: T[]): T[] =>
  costs.filter((cost) => hasNumericCost(cost.cost));

const stripTags = (value: string): string =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * `YOUR 1ST TO 3RD UNITS COST` → `1st to 3rd units`, `YOUR 3RD + UNIT COSTS` → `3rd+ unit`.
 * The generic `YOUR UNIT COSTS` header carries no information and formats to ``.
 */
export const formatCostSection = (section: string): string => {
  const cleaned = stripTags(section)
    .replace(/^YOUR\s+/i, '')
    .replace(/\s+COSTS?$/i, '')
    .replace(/\s*\+/g, '+')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  return /^units?$/.test(cleaned) ? '' : cleaned;
};

/**
 * Ordinal range of same-datasheet units a cost bracket applies to:
 * `YOUR 1ST TO 2ND UNITS COST` → [1, 2], `YOUR 3RD + UNIT COSTS` → [3, Infinity],
 * `YOUR 1ST UNIT COSTS` → [1, 1]. Generic / unparseable headers cover every unit.
 */
export const getCostBracketRange = (section?: string): [number, number] => {
  const cleaned = stripTags(section ?? '');
  const ordinals = cleaned.match(/\d+/g)?.map(Number) ?? [];
  if (ordinals.length === 0) {
    return [1, Infinity];
  }
  return [ordinals[0], cleaned.includes('+') ? Infinity : ordinals[ordinals.length - 1]];
};

/** Whether the Nth copy of a datasheet falls inside a cost bracket header. */
export const inCostBracket = (ordinal: number, section?: string): boolean => {
  const [min, max] = getCostBracketRange(section);
  return ordinal >= min && ordinal <= max;
};

/**
 * Selectable cost rows that apply to the Nth copy of a datasheet (default: the first).
 * Falls back to every selectable row when no bracket covers that ordinal.
 */
export const modelCostsForOrdinal = <T extends ModelCost>(costs: T[], ordinal = 1): T[] => {
  const selectable = selectableModelCosts(costs);
  const matching = selectable.filter((cost) => inCostBracket(ordinal, cost.section));
  return matching.length > 0 ? matching : selectable;
};

export const formatModelCostLabel = (
  cost: Pick<ModelCost, 'description' | 'cost' | 'section'>,
  fallbackName?: string
): string => {
  const description = cost.description || fallbackName || 'Unit';
  const section = cost.section ? formatCostSection(cost.section) : '';
  const pts = `(${cost.cost} pts)`;
  return section ? `${description} · ${section} ${pts}` : `${description} ${pts}`;
};

export interface ModelCostGroup<T extends ModelCost = ModelCost> {
  /** Human label for the cost bracket, `` when the datasheet has a single generic bracket. */
  section: string;
  costs: T[];
}

/** Selectable costs grouped by cost bracket, in source order. */
export const groupModelCostsBySection = <T extends ModelCost>(costs: T[]): ModelCostGroup<T>[] =>
  [
    ...groupBy(selectableModelCosts(costs), (cost) =>
      cost.section ? formatCostSection(cost.section) : ''
    )
  ].map(([section, costs]) => ({ section, costs }));

const collapseDuplicateCosts = (costs: ModelCost[]): ModelCost[] => {
  const seen = new Set<string>();
  return costs.filter((cost) => {
    const key = `${cost.description}\0${cost.cost}\0${cost.section ?? ''}`;
    return !seen.has(key) && seen.add(key);
  });
};

const normalizeDatasheetCosts = (rows: DatasheetModelCost[]): ModelCost[] => {
  let section: string | undefined;
  const costs: ModelCost[] = [];

  for (const row of rows) {
    if (!hasNumericCost(row.cost)) {
      const header = stripTags(row.description);
      if (header) {
        section = header;
      }
      continue;
    }

    costs.push({
      datasheetId: row.datasheetId,
      line: row.line,
      description: row.description,
      cost: row.cost.trim(),
      ...(section ? { section } : {})
    });
  }

  return collapseDuplicateCosts(costs);
};

/**
 * Drop empty-cost header rows, stamp the preceding header onto real cost rows as
 * `section`, and collapse exact (description, cost, section) duplicates.
 */
export const normalizeModelCosts = (rows: DatasheetModelCost[]): ModelCost[] =>
  [...groupBy(rows, (row) => row.datasheetId).values()].flatMap(normalizeDatasheetCosts);

/**
 * Display points for a list row: the cheapest numeric cost, suffixed with `+`
 * when the datasheet offers more than one price (unit size or cost bracket).
 * `null` when nothing on the sheet has a numeric cost.
 */
export const summarizeModelCosts = (costs: ModelCost[]): string | null => {
  const values = selectableModelCosts(costs).map((cost) => parseInt(cost.cost, 10));
  if (values.length === 0) return null;

  const cheapest = Math.min(...values);
  return new Set(values).size > 1 ? `${cheapest}+` : `${cheapest}`;
};

/**
 * Labels a set of cost options, dropping the bracket ("1st to 2nd units") when
 * every option shares it — callers filter by ordinal first, so it is usually
 * the same on every row and only adds noise.
 */
export const formatModelCostOptions = <T extends ModelCost>(
  costs: T[],
  fallbackName?: string
): { cost: T; label: string }[] => {
  const showSection = new Set(costs.map((cost) => cost.section ?? '')).size > 1;

  return costs.map((cost) => ({
    cost,
    label: formatModelCostLabel(showSection ? cost : { ...cost, section: undefined }, fallbackName)
  }));
};
