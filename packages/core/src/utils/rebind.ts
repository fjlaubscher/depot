import type {
  Ability,
  Collection,
  CollectionUnit,
  Datasheet,
  DatasheetSummary,
  ModelCost,
  RosterUnit,
  Wargear
} from '../types/depot.js';
import { normalizeSelectedWargearAbilities, formatAbilityName } from './abilities.js';
import { calculateCollectionPoints } from './collection.js';

export type RebindIssue =
  | { kind: 'datasheet-missing'; key: string; name: string }
  | { kind: 'model-cost-unmatched'; from: string }
  | { kind: 'wargear-dropped'; name: string }
  | { kind: 'ability-dropped'; name: string };

export type RebindStatus = 'ok' | 'partial' | 'missing';

export type RebindUnitSelections = {
  modelCost: ModelCost;
  selectedWargear: Wargear[];
  selectedWargearAbilities: Ability[];
  issues: RebindIssue[];
  status: Exclude<RebindStatus, 'missing'>;
};

export type RebindCollectionUnitResult = {
  item: CollectionUnit;
  status: RebindStatus;
  issues: RebindIssue[];
};

export type RebindRosterUnitResult = {
  unit: RosterUnit;
  status: RebindStatus;
  issues: RebindIssue[];
};

export type RebindCollectionResult = {
  collection: Collection;
  items: RebindCollectionUnitResult[];
  summary: { ok: number; partial: number; missing: number };
};

const normalizeKey = (value: string | undefined | null): string =>
  (value ?? '').trim().toLowerCase();

/**
 * Match a datasheet from a catalog list using id → slug → name.
 * Works with full datasheets or manifest summaries.
 */
export function matchDatasheetIdentity<T extends { id: string; slug: string; name: string }>(
  identity: { id?: string; slug?: string; name?: string },
  candidates: T[]
): T | null {
  if (candidates.length === 0) return null;

  const id = identity.id?.trim();
  if (id) {
    const byId = candidates.find((entry) => entry.id === id);
    if (byId) return byId;
  }

  const slug = identity.slug?.trim();
  if (slug) {
    const bySlug = candidates.find((entry) => entry.slug === slug);
    if (bySlug) return bySlug;
  }

  const name = normalizeKey(identity.name);
  if (name) {
    const byName = candidates.find((entry) => normalizeKey(entry.name) === name);
    if (byName) return byName;
  }

  return null;
}

/**
 * Resolve identity keys from a collection/roster unit for catalog lookup.
 */
export function unitDatasheetIdentity(unit: { datasheet: Datasheet; datasheetSlug?: string }): {
  id?: string;
  slug?: string;
  name?: string;
} {
  return {
    id: unit.datasheet.id,
    slug: unit.datasheetSlug || unit.datasheet.slug,
    name: unit.datasheet.name
  };
}

export function rebindModelCost(
  modelCost: ModelCost,
  available: ModelCost[]
): { modelCost: ModelCost; matched: boolean } {
  if (available.length === 0) {
    return { modelCost, matched: false };
  }

  const byLine = available.find((entry) => entry.line === modelCost.line);
  if (byLine) {
    return { modelCost: byLine, matched: true };
  }

  const description = normalizeKey(modelCost.description);
  if (description) {
    const byDescription = available.find(
      (entry) => normalizeKey(entry.description) === description
    );
    if (byDescription) {
      return { modelCost: byDescription, matched: true };
    }
  }

  // Fall back to first cost option so points stay catalog-native when possible.
  return { modelCost: available[0], matched: false };
}

export function rebindSelectedWargear(
  selection: Wargear[] = [],
  available: Wargear[]
): { wargear: Wargear[]; dropped: string[] } {
  if (selection.length === 0 || available.length === 0) {
    return {
      wargear: [],
      dropped: selection.map((weapon) => weapon.name).filter(Boolean)
    };
  }

  const byId = new Map(available.map((weapon) => [weapon.id, weapon]));
  const byName = new Map(available.map((weapon) => [normalizeKey(weapon.name), weapon]));
  const matched: Wargear[] = [];
  const dropped: string[] = [];
  const seen = new Set<string>();

  for (const weapon of selection) {
    const hit = byId.get(weapon.id) ?? byName.get(normalizeKey(weapon.name));
    if (!hit) {
      if (weapon.name) dropped.push(weapon.name);
      continue;
    }
    if (seen.has(hit.id)) continue;
    seen.add(hit.id);
    matched.push(hit);
  }

  return { wargear: matched, dropped };
}

/**
 * Best-effort rebind of selections onto a catalog datasheet (same or new edition).
 */
export function rebindUnitSelections(
  input: {
    modelCost: ModelCost;
    selectedWargear?: Wargear[];
    selectedWargearAbilities?: Ability[];
  },
  datasheet: Datasheet
): RebindUnitSelections {
  const issues: RebindIssue[] = [];

  const { modelCost, matched: costMatched } = rebindModelCost(
    input.modelCost,
    datasheet.modelCosts ?? []
  );
  if (!costMatched) {
    issues.push({
      kind: 'model-cost-unmatched',
      from: input.modelCost.description || input.modelCost.line || input.modelCost.cost
    });
  }

  const { wargear, dropped } = rebindSelectedWargear(
    input.selectedWargear ?? [],
    datasheet.wargear ?? []
  );
  for (const name of dropped) {
    issues.push({ kind: 'wargear-dropped', name });
  }

  const previousAbilities = input.selectedWargearAbilities ?? [];
  const selectedWargearAbilities = normalizeSelectedWargearAbilities(
    previousAbilities,
    datasheet.abilities ?? []
  );
  if (previousAbilities.length > selectedWargearAbilities.length) {
    const kept = new Set(
      selectedWargearAbilities.map((ability) => normalizeKey(formatAbilityName(ability)))
    );
    for (const ability of previousAbilities) {
      const label = formatAbilityName(ability) || ability.name;
      if (label && !kept.has(normalizeKey(label))) {
        issues.push({ kind: 'ability-dropped', name: label });
      }
    }
  }

  return {
    modelCost,
    selectedWargear: wargear,
    selectedWargearAbilities,
    issues,
    status: issues.length > 0 ? 'partial' : 'ok'
  };
}

export function rebindCollectionUnit(
  item: CollectionUnit,
  datasheet: Datasheet | null
): RebindCollectionUnitResult {
  if (!datasheet) {
    const identity = unitDatasheetIdentity(item);
    return {
      item,
      status: 'missing',
      issues: [
        {
          kind: 'datasheet-missing',
          key: identity.id || identity.slug || identity.name || 'unknown',
          name: item.datasheet.name || identity.slug || identity.id || 'Unknown unit'
        }
      ]
    };
  }

  const rebound = rebindUnitSelections(item, datasheet);
  return {
    item: {
      ...item,
      datasheet,
      datasheetSlug: datasheet.slug,
      modelCost: rebound.modelCost,
      selectedWargear: rebound.selectedWargear,
      selectedWargearAbilities: rebound.selectedWargearAbilities
    },
    status: rebound.status,
    issues: rebound.issues
  };
}

export function rebindRosterUnit(
  unit: RosterUnit,
  datasheet: Datasheet | null
): RebindRosterUnitResult {
  if (!datasheet) {
    const identity = unitDatasheetIdentity(unit);
    return {
      unit,
      status: 'missing',
      issues: [
        {
          kind: 'datasheet-missing',
          key: identity.id || identity.slug || identity.name || 'unknown',
          name: unit.datasheet.name || identity.slug || identity.id || 'Unknown unit'
        }
      ]
    };
  }

  const rebound = rebindUnitSelections(unit, datasheet);
  return {
    unit: {
      ...unit,
      datasheet,
      datasheetSlug: datasheet.slug,
      modelCost: rebound.modelCost,
      selectedWargear: rebound.selectedWargear,
      selectedWargearAbilities: rebound.selectedWargearAbilities
    },
    status: rebound.status,
    issues: rebound.issues
  };
}

export function summarizeRebindStatuses(statuses: RebindStatus[]): {
  ok: number;
  partial: number;
  missing: number;
} {
  return statuses.reduce(
    (acc, status) => {
      acc[status] += 1;
      return acc;
    },
    { ok: 0, partial: 0, missing: 0 }
  );
}

/**
 * Apply rebind results to a collection and recalculate points.
 * Always stamps dataVersion when provided (partial/missing still update the stamp).
 */
export function applyCollectionRebind(
  collection: Collection,
  itemResults: RebindCollectionUnitResult[],
  dataVersion?: string | null
): RebindCollectionResult {
  const items = itemResults.map((result) => result.item);
  const summary = summarizeRebindStatuses(itemResults.map((result) => result.status));

  return {
    collection: {
      ...collection,
      dataVersion: dataVersion ?? collection.dataVersion ?? null,
      items,
      points: { current: calculateCollectionPoints({ ...collection, items }) }
    },
    items: itemResults,
    summary
  };
}

/** Lookup helper for name-based match against a faction manifest summary list. */
export function matchDatasheetSummary(
  identity: { id?: string; slug?: string; name?: string },
  summaries: DatasheetSummary[]
): DatasheetSummary | null {
  return matchDatasheetIdentity(identity, summaries);
}
