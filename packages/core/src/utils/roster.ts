import type { Roster, RosterUnit } from '../types/depot.js';
import { formatAbilityName } from './abilities.js';
import { formatWargearDisplayName } from './wargear.js';

const randomId = () => {
  const cryptoObj = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }
  return `roster-${Math.random().toString(36).slice(2)}`;
};

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

export const groupRosterUnitsByRole = (units: RosterUnit[]): Record<string, RosterUnit[]> => {
  const dictionary: Record<string, RosterUnit[]> = {};

  units.forEach((unit) => {
    const role = unit.datasheet.role;
    const existing = dictionary[role];
    dictionary[role] = existing ? [...existing, unit] : [unit];
  });

  Object.keys(dictionary).forEach((key) => {
    dictionary[key] = dictionary[key].sort((a, b) =>
      a.datasheet.name.localeCompare(b.datasheet.name)
    );
  });

  return dictionary;
};

export interface GenerateRosterMarkdownOptions {
  includeWargear?: boolean;
  includeWargearAbilities?: boolean;
}

export const generateRosterMarkdown = (
  roster: Roster,
  factionName?: string,
  options: GenerateRosterMarkdownOptions = {}
): string => {
  const includeWargear = options.includeWargear ?? true;
  const includeWargearAbilities = options.includeWargearAbilities ?? includeWargear;
  const lines: string[] = [];

  lines.push(`# ${roster.name}`);
  lines.push('');

  if (factionName) {
    lines.push(`**Faction:** ${factionName}`);
  }
  if (roster.detachment?.name) {
    lines.push(`**Detachment:** ${roster.detachment.name}`);
  }
  lines.push(`**Points:** ${roster.points.current} / ${roster.points.max}`);
  lines.push('');

  const unitsByRole: Record<string, RosterUnit[]> = {};
  roster.units.forEach((unit) => {
    const role = unit.datasheet.role;
    if (!unitsByRole[role]) {
      unitsByRole[role] = [];
    }
    unitsByRole[role].push(unit);
  });

  const sortedRoles = Object.keys(unitsByRole).sort();
  sortedRoles.forEach((role) => {
    lines.push(`## ${role}`);
    lines.push('');

    unitsByRole[role].forEach((unit) => {
      const unitCost = parseInt(unit.modelCost.cost, 10) || 0;
      const warlordPrefix = roster.warlordUnitId === unit.id ? '[Warlord] ' : '';
      const unitName = `${warlordPrefix}${unit.datasheet.name}`.trim();
      lines.push(`- **${unitName}** - ${unit.modelCost.description} (${unitCost} pts)`);

      if (includeWargear && unit.selectedWargear.length > 0) {
        unit.selectedWargear.forEach((wargear) => {
          lines.push(`  - ${formatWargearDisplayName(wargear)}`);
        });
      }

      if (includeWargearAbilities && unit.selectedWargearAbilities?.length) {
        unit.selectedWargearAbilities.forEach((ability) => {
          lines.push(`  - [Wargear Ability] ${formatAbilityName(ability)}`);
        });
      }

      const unitEnhancements = roster.enhancements.filter((e) => e.unitId === unit.id);
      unitEnhancements.forEach(({ enhancement }) => {
        const enhancementCost = parseInt(enhancement.cost, 10) || 0;
        lines.push(`  - [Enhancement] ${enhancement.name} (${enhancementCost} pts)`);
      });
    });

    lines.push('');
  });

  return lines.join('\n');
};

export interface DuplicateRosterOptions {
  name?: string;
  dataVersion?: string | null;
}

export const createRosterDuplicate = (
  roster: Roster,
  options: DuplicateRosterOptions = {}
): Roster => {
  const unitIdMap = new Map<string, string>();

  const duplicatedUnits = roster.units.map((unit) => {
    const duplicatedUnitId = randomId();
    unitIdMap.set(unit.id, duplicatedUnitId);

    return {
      ...unit,
      id: duplicatedUnitId,
      modelCost: { ...unit.modelCost },
      selectedWargear: unit.selectedWargear.map((wargear) => ({ ...wargear })),
      selectedWargearAbilities: unit.selectedWargearAbilities?.map((ability) => ({ ...ability }))
    };
  });

  const duplicatedEnhancements = roster.enhancements.map((enhancement) => ({
    ...enhancement,
    unitId: enhancement.unitId
      ? (unitIdMap.get(enhancement.unitId) ?? enhancement.unitId)
      : enhancement.unitId
  }));

  const duplicatedRoster: Roster = {
    ...roster,
    id: randomId(),
    name: options.name ?? `${roster.name} (Copy)`,
    dataVersion: options.dataVersion ?? roster.dataVersion ?? null,
    units: duplicatedUnits,
    enhancements: duplicatedEnhancements,
    warlordUnitId: roster.warlordUnitId ? (unitIdMap.get(roster.warlordUnitId) ?? null) : null,
    points: {
      ...roster.points
    }
  };

  return {
    ...duplicatedRoster,
    points: {
      ...duplicatedRoster.points,
      current: calculateTotalPoints(duplicatedRoster)
    }
  };
};
