import type { Detachment, Roster } from '../types/depot.js';
import { toTitleCase } from './datasheets.js';

/** Selected detachments, falling back to the legacy single `detachment` field. */
export const getRosterDetachments = (
  roster: Partial<Pick<Roster, 'detachments' | 'detachment'>>
): Detachment[] =>
  roster.detachments?.length ? roster.detachments : roster.detachment ? [roster.detachment] : [];

export const getRosterDetachmentNames = (
  roster: Partial<Pick<Roster, 'detachments' | 'detachment'>>
): string =>
  getRosterDetachments(roster)
    .map((detachment) => detachment.name)
    .join(', ');

// Available in Node >= 18 and all modern browsers; not declared by the ES2022 TS lib.
declare const crypto: { randomUUID: () => string };
declare const structuredClone: <T>(value: T) => T;

export const calculateTotalPoints = (roster: Roster): number => {
  let total = 0;

  roster.units.forEach((unit) => {
    total += parseInt(unit.modelCost.cost, 10) || 0;
  });

  roster.enhancements.forEach(({ enhancement }) => {
    total += parseInt(enhancement.cost, 10) || 0;
  });

  return total;
};

export interface DuplicateRosterOptions {
  dataVersion?: string | null;
}

export const createRosterDuplicate = (
  roster: Roster,
  options: DuplicateRosterOptions = {}
): Roster => {
  const copy = structuredClone(roster);
  const unitIdMap = new Map(copy.units.map((unit) => [unit.id, crypto.randomUUID()]));

  copy.id = crypto.randomUUID();
  copy.name = `${roster.name} (Copy)`;
  copy.dataVersion = options.dataVersion ?? roster.dataVersion ?? null;
  copy.units.forEach((unit) => {
    unit.id = unitIdMap.get(unit.id)!;
  });
  copy.enhancements.forEach((enhancement) => {
    if (enhancement.unitId) {
      enhancement.unitId = unitIdMap.get(enhancement.unitId) ?? enhancement.unitId;
    }
  });
  copy.warlordUnitId = copy.warlordUnitId ? (unitIdMap.get(copy.warlordUnitId) ?? null) : null;
  copy.points.current = calculateTotalPoints(copy);

  return copy;
};

export const getRosterFactionName = (roster: Roster): string => {
  if (roster.faction?.name) {
    return roster.faction.name;
  }

  const slug = roster.factionSlug || roster.faction?.slug;
  return slug ? toTitleCase(slug) || slug : '';
};

export interface GenerateRosterShareTextOptions {
  includeWargear?: boolean;
  includeWargearAbilities?: boolean;
}

export const generateRosterShareText = (
  roster: Roster,
  factionName?: string,
  options: GenerateRosterShareTextOptions = {}
): string => {
  const includeWargear = options.includeWargear ?? false;
  const includeWargearAbilities = options.includeWargearAbilities ?? includeWargear;
  const lines: string[] = [];

  lines.push(`*${roster.name}*`);
  lines.push('');

  if (factionName) {
    lines.push(`*Faction:* ${factionName}`);
  }
  const detachments = getRosterDetachments(roster);
  if (detachments.length > 0) {
    const label = detachments.length === 1 ? 'Detachment' : 'Detachments';
    lines.push(
      `*${label}:* ${detachments
        .map((detachment) =>
          [detachment.name, detachment.dp && `${detachment.dp} DP`, detachment.forceDisposition]
            .filter(Boolean)
            .join(' · ')
        )
        .join('; ')}`
    );
  }
  lines.push(`*Points:* ${roster.points.current} / ${roster.points.max}`);
  lines.push('');

  const sortedUnits = [...roster.units].sort((a, b) =>
    a.datasheet.name.localeCompare(b.datasheet.name)
  );
  sortedUnits.forEach((unit) => {
    const unitCost = parseInt(unit.modelCost.cost, 10) || 0;
    const warlordPrefix = roster.warlordUnitId === unit.id ? '[Warlord] ' : '';
    const unitName = `${warlordPrefix}${unit.datasheet.name}`.trim();
    lines.push(`- ${unitName} - ${unit.modelCost.description} (${unitCost} pts)`);

    if (includeWargear && unit.selectedWargear.length > 0) {
      unit.selectedWargear.forEach((wargear) => {
        lines.push(`  - ${wargear.name}`);
      });
    }

    if (includeWargearAbilities && unit.selectedWargearAbilities?.length) {
      unit.selectedWargearAbilities.forEach((ability) => {
        lines.push(`  - [Wargear Ability] ${ability.name}`);
      });
    }

    const unitEnhancements = roster.enhancements.filter((e) => e.unitId === unit.id);
    unitEnhancements.forEach(({ enhancement }) => {
      const enhancementCost = parseInt(enhancement.cost, 10) || 0;
      lines.push(`  - [Enhancement] ${enhancement.name} (${enhancementCost} pts)`);
    });
  });

  if (sortedUnits.length > 0) {
    lines.push('');
  }

  return lines.join('\n');
};
