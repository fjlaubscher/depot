import type { Roster, RosterUnit } from '../types/depot.js';

const titleCaseSlug = (slug?: string | null): string => {
  if (!slug) {
    return '';
  }

  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const getRosterFactionName = (roster: Roster): string => {
  if (roster.faction?.name) {
    return roster.faction.name;
  }

  if (roster.factionSlug) {
    return titleCaseSlug(roster.factionSlug) || roster.factionSlug;
  }

  if (roster.faction?.slug) {
    return titleCaseSlug(roster.faction.slug) || roster.faction.slug;
  }

  return '';
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
  if (roster.detachment?.name) {
    lines.push(`*Detachment:* ${roster.detachment.name}`);
  }
  lines.push(`*Points:* ${roster.points.current} / ${roster.points.max}`);
  lines.push('');

  const unitsByRole: { [role: string]: RosterUnit[] } = {};
  roster.units.forEach((unit) => {
    const role = unit.datasheet.role;
    if (!unitsByRole[role]) unitsByRole[role] = [];
    unitsByRole[role].push(unit);
  });

  const sortedRoles = Object.keys(unitsByRole).sort();
  sortedRoles.forEach((role) => {
    lines.push(`*${role}*`);
    unitsByRole[role].forEach((unit) => {
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
    lines.push('');
  });

  return lines.join('\n');
};
