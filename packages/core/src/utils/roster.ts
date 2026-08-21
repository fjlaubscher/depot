import type { Detachment, Roster } from '../types/depot.js';
import { toTitleCase } from './datasheets.js';
import { formatDetachmentOptionLabel } from './detachments.js';

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

const points = (cost: string) => parseInt(cost, 10) || 0;

export const calculateTotalPoints = (roster: Roster): number =>
  roster.units.reduce((total, unit) => total + points(unit.modelCost.cost), 0) +
  roster.enhancements.reduce((total, { enhancement }) => total + points(enhancement.cost), 0);

/** Fresh roster + unit ids, with enhancement/warlord references remapped to the new unit ids. */
export const remapRosterIds = (roster: Roster): Roster => {
  const unitIds = new Map(roster.units.map((unit) => [unit.id, crypto.randomUUID()]));
  return {
    ...roster,
    id: crypto.randomUUID(),
    units: roster.units.map((unit) => ({ ...unit, id: unitIds.get(unit.id)! })),
    // Drop enhancements whose unit is missing — imports are untrusted files.
    enhancements: roster.enhancements.flatMap((entry) => {
      const unitId = unitIds.get(entry.unitId);
      return unitId ? [{ ...entry, unitId }] : [];
    }),
    warlordUnitId: roster.warlordUnitId ? (unitIds.get(roster.warlordUnitId) ?? null) : null
  };
};

export const createRosterDuplicate = (
  roster: Roster,
  options: { dataVersion?: string | null } = {}
): Roster => {
  const copy = remapRosterIds(structuredClone(roster));
  copy.name = `${roster.name} (Copy)`;
  copy.dataVersion = options.dataVersion ?? roster.dataVersion ?? null;
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

/** "Faction • Detachment A, Detachment B" (or just the faction when no detachments). */
export const getRosterSubtitle = (roster: Roster): string => {
  const factionName = getRosterFactionName(roster);
  const detachmentNames = getRosterDetachmentNames(roster);
  return factionName && detachmentNames ? `${factionName} • ${detachmentNames}` : factionName;
};

export interface GenerateRosterShareTextOptions {
  includeWargear?: boolean;
}

export const generateRosterShareText = (
  roster: Roster,
  factionName?: string,
  options: GenerateRosterShareTextOptions = {}
): string => {
  const includeWargear = options.includeWargear ?? false;
  const lines: string[] = [];

  lines.push(`*${roster.name}*`);
  lines.push('');

  if (factionName) {
    lines.push(`*Faction:* ${factionName}`);
  }
  const detachments = getRosterDetachments(roster);
  if (detachments.length > 0) {
    const label = detachments.length === 1 ? 'Detachment' : 'Detachments';
    lines.push(`*${label}:* ${detachments.map(formatDetachmentOptionLabel).join('; ')}`);
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

    if (includeWargear && unit.selectedWargearAbilities?.length) {
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
