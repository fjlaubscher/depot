import type { depot } from '@depot/core';
import { calculateTotalPoints } from '@/contexts/roster/utils';

const stripHtml = (html?: string): string => {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/(p|div|ul|ol|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const groupRosterUnitsByRole = (units: depot.RosterUnit[]) => {
  let dictionary: { [role: string]: depot.RosterUnit[] } = {};

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const role = unit.datasheet.role;
    const unitsByRole = dictionary[role];
    dictionary[role] = unitsByRole ? [...unitsByRole, unit] : [unit];
  }

  // Sort units within each role by datasheet name
  Object.keys(dictionary).forEach((key) => {
    dictionary[key] = dictionary[key].sort((a, b) =>
      a.datasheet.name.localeCompare(b.datasheet.name)
    );
  });

  return dictionary;
};

const titleCaseSlug = (slug?: string): string => {
  if (!slug) {
    return '';
  }

  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const getRosterFactionName = (roster: depot.Roster): string => {
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

interface GenerateRosterMarkdownOptions {
  includeWargear?: boolean;
}

export const generateRosterMarkdown = (
  roster: depot.Roster,
  factionName?: string,
  options: GenerateRosterMarkdownOptions = {}
): string => {
  const { includeWargear = true } = options;
  const lines: string[] = [];

  // Header
  lines.push(`# ${roster.name}`);
  lines.push('');

  // Faction and Detachment info
  if (factionName) {
    lines.push(`**Faction:** ${factionName}`);
  }
  if (roster.detachment?.name) {
    lines.push(`**Detachment:** ${roster.detachment.name}`);
  }
  lines.push(`**Points:** ${roster.points.current} / ${roster.points.max}`);
  lines.push('');

  // Units grouped by role
  const unitsByRole: { [role: string]: depot.RosterUnit[] } = {};
  roster.units.forEach((unit) => {
    const role = unit.datasheet.role;
    if (!unitsByRole[role]) {
      unitsByRole[role] = [];
    }
    unitsByRole[role].push(unit);
  });

  // Sort roles alphabetically
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
          lines.push(`  - ${wargear.name}`);
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

  lines.push('https://fjlaubscher.github.io/depot');

  return lines.join('\n');
};

interface GenerateRosterShareTextOptions {
  includeWargear?: boolean;
}

export const generateRosterShareText = (
  roster: depot.Roster,
  factionName?: string,
  options: GenerateRosterShareTextOptions = {}
): string => {
  const { includeWargear = false } = options;
  const lines: string[] = [];

  // Title (no heading syntax)
  lines.push(`*${roster.name}*`);
  lines.push('');

  // Basic info
  if (factionName) {
    lines.push(`*Faction:* ${factionName}`);
  }
  if (roster.detachment?.name) {
    lines.push(`*Detachment:* ${roster.detachment.name}`);
  }
  lines.push(`*Points:* ${roster.points.current} / ${roster.points.max}`);
  lines.push('');

  // Units grouped by role
  const unitsByRole: { [role: string]: depot.RosterUnit[] } = {};
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
      const unitEnhancements = roster.enhancements.filter((e) => e.unitId === unit.id);
      unitEnhancements.forEach(({ enhancement }) => {
        const enhancementCost = parseInt(enhancement.cost, 10) || 0;
        lines.push(`  - [Enhancement] ${enhancement.name} (${enhancementCost} pts)`);
      });
    });
    lines.push('');
  });

  lines.push('https://fjlaubscher.github.io/depot');

  return lines.join('\n');
};

interface DuplicateRosterOptions {
  name?: string;
}

export const createRosterDuplicate = (
  roster: depot.Roster,
  options: DuplicateRosterOptions = {}
): depot.Roster => {
  const unitIdMap = new Map<string, string>();

  const duplicatedUnits = roster.units.map((unit) => {
    const duplicatedUnitId = crypto.randomUUID();
    unitIdMap.set(unit.id, duplicatedUnitId);

    return {
      ...unit,
      id: duplicatedUnitId,
      modelCost: { ...unit.modelCost },
      selectedWargear: unit.selectedWargear.map((wargear) => ({ ...wargear }))
    };
  });

  const duplicatedEnhancements = roster.enhancements.map((enhancement) => ({
    ...enhancement,
    unitId: enhancement.unitId
      ? (unitIdMap.get(enhancement.unitId) ?? enhancement.unitId)
      : enhancement.unitId
  }));

  const duplicatedRoster: depot.Roster = {
    ...roster,
    id: crypto.randomUUID(),
    name: options.name ?? `${roster.name} (Copy)`,
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
