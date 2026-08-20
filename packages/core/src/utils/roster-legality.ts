import type { Datasheet, Detachment, Enhancement, Roster, RosterUnit } from '../types/depot.js';
import { getCostBracketRange } from './model-costs.js';
import { getRosterDetachments } from './roster.js';

/** Core rules 25.03 battle-size table. */
export interface BattleSize {
  name: string;
  points: number;
  dp: number;
  enhancementLimit: number;
  unitLimit: number;
}

export const BATTLE_SIZES: BattleSize[] = [
  { name: 'Incursion', points: 1000, dp: 2, enhancementLimit: 2, unitLimit: 2 },
  { name: 'Strike Force', points: 2000, dp: 3, enhancementLimit: 4, unitLimit: 3 }
];

/** Smallest battle size whose points total covers `maxPoints`; anything above 2000 uses Strike Force. */
export const getBattleSize = (maxPoints: number): BattleSize =>
  BATTLE_SIZES.find((size) => maxPoints <= size.points) ?? BATTLE_SIZES[BATTLE_SIZES.length - 1];

const hasKeyword = (datasheet: Pick<Datasheet, 'keywords'>, keyword: string): boolean =>
  datasheet.keywords.some((entry) => entry.keyword.trim().toLowerCase() === keyword.toLowerCase());

/** DP a detachment costs this roster, honouring chapter overrides when a unit carries that keyword. */
export const getDetachmentDp = (detachment: Detachment, units: RosterUnit[]): number => {
  const override = detachment.chapterDp.find((entry) =>
    units.some((unit) => hasKeyword(unit.datasheet, entry.keyword))
  );
  return parseInt((override ?? detachment).dp, 10) || 0;
};

export const getRosterDpSpent = (
  roster: Partial<Pick<Roster, 'detachments' | 'detachment'>> & Pick<Roster, 'units'>
): number =>
  getRosterDetachments(roster).reduce(
    (total, detachment) => total + getDetachmentDp(detachment, roster.units),
    0
  );

const inBracket = (ordinal: number, section?: string): boolean => {
  const [min, max] = getCostBracketRange(section);
  return ordinal >= min && ordinal <= max;
};

/**
 * Repeat-cost brackets: the Nth copy of a datasheet must pay the bracket covering N.
 * Swaps each unit onto the same-size row of the right bracket; leaves it alone if none exists.
 */
export const enforceCostBrackets = (units: RosterUnit[]): RosterUnit[] => {
  const seen = new Map<string, number>();
  return units.map((unit) => {
    const ordinal = (seen.get(unit.datasheet.id) ?? 0) + 1;
    seen.set(unit.datasheet.id, ordinal);
    if (inBracket(ordinal, unit.modelCost.section)) {
      return unit;
    }
    const replacement = unit.datasheet.modelCosts.find(
      (cost) => cost.description === unit.modelCost.description && inBracket(ordinal, cost.section)
    );
    return replacement ? { ...unit, modelCost: replacement } : unit;
  });
};

/** Enhancements a unit may take: characters take any, other units only Upgrades, Epic Heroes none. */
export const getEligibleEnhancements = (
  unit: RosterUnit,
  roster: Partial<Pick<Roster, 'detachments' | 'detachment'>>
): Enhancement[] => {
  if (hasKeyword(unit.datasheet, 'Epic Hero')) {
    return [];
  }
  const pool = getRosterDetachments(roster).flatMap((detachment) => detachment.enhancements);
  return hasKeyword(unit.datasheet, 'Character')
    ? pool
    : pool.filter((enhancement) => enhancement.upgrade);
};

export interface RosterIssue {
  code: string;
  message: string;
  unitId?: string;
}

/** Support units each need their own bodyguard; returns the support units left unmatched. */
const unmatchedSupportUnits = (units: RosterUnit[]): RosterUnit[] => {
  const supports = units.filter((unit) => unit.datasheet.isSupport);
  const taken = new Map<string, RosterUnit>(); // bodyguard id → support unit
  const canLead = (support: RosterUnit, bodyguard: RosterUnit): boolean =>
    bodyguard.id !== support.id &&
    support.datasheet.leaders.some((leader) => leader.id === bodyguard.datasheet.id);

  const place = (support: RosterUnit, visited: Set<string>): boolean => {
    for (const bodyguard of units) {
      if (!canLead(support, bodyguard) || visited.has(bodyguard.id)) continue;
      visited.add(bodyguard.id);
      const current = taken.get(bodyguard.id);
      if (!current || place(current, visited)) {
        taken.set(bodyguard.id, support);
        return true;
      }
    }
    return false;
  };

  return supports.filter((support) => !place(support, new Set()));
};

const countBy = <T>(items: T[], key: (item: T) => string): Map<string, number> =>
  items.reduce((counts, item) => {
    const k = key(item);
    counts.set(k, (counts.get(k) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());

/** Core rules 25.03 / 25.04 army-roster restrictions. Empty array = legal. */
export const validateRoster = (roster: Roster): RosterIssue[] => {
  const issues: RosterIssue[] = [];
  const size = getBattleSize(roster.points.max);
  const detachments = getRosterDetachments(roster);
  const { units } = roster;
  const unitName = (id: string) => units.find((unit) => unit.id === id)?.datasheet.name ?? 'Unit';

  if (roster.points.current > roster.points.max) {
    issues.push({
      code: 'points',
      message: `${roster.points.current} pts exceeds the ${roster.points.max} pt limit.`
    });
  }

  if (detachments.length === 0) {
    issues.push({ code: 'detachment', message: 'No detachment selected.' });
  }
  // A lone detachment is always legal (an Incursion army may take a single 3 DP detachment).
  const dpSpent = getRosterDpSpent(roster);
  if (detachments.length > 1 && dpSpent > size.dp) {
    issues.push({
      code: 'dp',
      message: `${dpSpent} DP spent; ${size.name} allows ${size.dp} DP.`
    });
  }
  if (new Set(detachments.map((detachment) => detachment.id)).size !== detachments.length) {
    issues.push({ code: 'detachment', message: 'The same detachment is selected more than once.' });
  }

  for (const [name, count] of countBy(units, (unit) => unit.datasheet.name)) {
    const datasheet = units.find((unit) => unit.datasheet.name === name)!.datasheet;
    const limit = hasKeyword(datasheet, 'Epic Hero')
      ? 1
      : hasKeyword(datasheet, 'Battleline') || hasKeyword(datasheet, 'Dedicated Transport')
        ? size.unitLimit * 2
        : size.unitLimit;
    if (count > limit) {
      issues.push({
        code: 'unit-limit',
        message: `${name}: ${count} units selected; ${size.name} allows ${limit}.`
      });
    }
  }

  const ordinals = new Map<string, number>();
  for (const unit of units) {
    const ordinal = (ordinals.get(unit.datasheet.id) ?? 0) + 1;
    ordinals.set(unit.datasheet.id, ordinal);
    if (!inBracket(ordinal, unit.modelCost.section)) {
      issues.push({
        code: 'bracket',
        unitId: unit.id,
        message: `${unit.datasheet.name} #${ordinal} is using the wrong cost bracket.`
      });
    }
  }

  if (units.length > 0 && !roster.warlordUnitId) {
    issues.push({ code: 'warlord', message: 'No Warlord selected.' });
  }

  const pool = new Set(
    detachments.flatMap((detachment) => detachment.enhancements.map((entry) => entry.id))
  );
  const byId = new Map<string, Enhancement>();
  roster.enhancements.forEach(({ enhancement }) => byId.set(enhancement.id, enhancement));
  const enhancementCounts = countBy(roster.enhancements, (entry) => entry.enhancement.id);
  let enhancementTotal = 0;
  for (const [id, count] of enhancementCounts) {
    const enhancement = byId.get(id)!;
    enhancementTotal += enhancement.upgrade ? 1 : count;
    if (!pool.has(id)) {
      issues.push({
        code: 'enhancement',
        message: `${enhancement.name} is not from a selected detachment.`
      });
    }
    const max = enhancement.upgrade ? 3 : 1;
    if (count > max) {
      issues.push({
        code: 'enhancement',
        message: `${enhancement.name} is taken ${count} times; max ${max}.`
      });
    }
  }
  if (enhancementTotal > size.enhancementLimit) {
    issues.push({
      code: 'enhancement',
      message: `${enhancementTotal} enhancements selected; ${size.name} allows ${size.enhancementLimit}.`
    });
  }
  for (const [unitId, count] of countBy(roster.enhancements, (entry) => entry.unitId)) {
    if (count > 1) {
      issues.push({
        code: 'enhancement',
        unitId,
        message: `${unitName(unitId)} has ${count} enhancements; max 1 per unit.`
      });
    }
  }
  for (const { enhancement, unitId } of roster.enhancements) {
    const unit = units.find((entry) => entry.id === unitId);
    if (!unit) continue;
    if (hasKeyword(unit.datasheet, 'Epic Hero')) {
      issues.push({
        code: 'enhancement',
        unitId,
        message: `${unit.datasheet.name} is an Epic Hero and cannot take ${enhancement.name}.`
      });
    } else if (!enhancement.upgrade && !hasKeyword(unit.datasheet, 'Character')) {
      issues.push({
        code: 'enhancement',
        unitId,
        message: `${unit.datasheet.name} is not a Character and cannot take ${enhancement.name}.`
      });
    }
  }

  for (const support of unmatchedSupportUnits(units)) {
    issues.push({
      code: 'support',
      unitId: support.id,
      message: `${support.datasheet.name} is a Support unit with no free bodyguard unit to attach to.`
    });
  }

  return issues;
};
