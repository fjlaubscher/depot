import type { ModelCost } from '../types/depot.js';

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
export const groupModelCostsBySection = <T extends ModelCost>(costs: T[]): ModelCostGroup<T>[] => {
  const groups: ModelCostGroup<T>[] = [];
  for (const cost of selectableModelCosts(costs)) {
    const section = cost.section ? formatCostSection(cost.section) : '';
    const group = groups.find((entry) => entry.section === section);
    if (group) {
      group.costs.push(cost);
    } else {
      groups.push({ section, costs: [cost] });
    }
  }
  return groups;
};

type RawModelCost = {
  datasheetId: string;
  line: string;
  description: string;
  cost: string;
};

const collapseDuplicateCosts = (costs: ModelCost[]): ModelCost[] => {
  const seen = new Set<string>();
  return costs.filter((cost) => {
    const key = `${cost.description}\0${cost.cost}\0${cost.section ?? ''}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const normalizeDatasheetCosts = (rows: RawModelCost[]): ModelCost[] => {
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
export const normalizeModelCosts = (rows: RawModelCost[]): ModelCost[] => {
  const byDatasheet = new Map<string, RawModelCost[]>();
  for (const row of rows) {
    const group = byDatasheet.get(row.datasheetId) ?? [];
    group.push(row);
    byDatasheet.set(row.datasheetId, group);
  }

  return Array.from(byDatasheet.values()).flatMap(normalizeDatasheetCosts);
};
