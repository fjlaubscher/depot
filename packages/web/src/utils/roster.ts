import { depot } from '@depot/core';

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

export const generateRosterMarkdown = (roster: depot.Roster, factionName?: string): string => {
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
      lines.push(`- **${unit.datasheet.name}** - ${unit.modelCost.description} (${unitCost} pts)`);

      // Add wargear if present
      if (unit.selectedWargear.length > 0) {
        unit.selectedWargear.forEach((wargear) => {
          lines.push(`  - ${wargear.name}`);
        });
      }
    });

    lines.push('');
  });

  // Enhancements if present
  if (roster.enhancements.length > 0) {
    lines.push('## Enhancements');
    lines.push('');

    roster.enhancements.forEach(({ enhancement }) => {
      const enhancementCost = parseInt(enhancement.cost, 10) || 0;
      lines.push(`- **${enhancement.name}** (${enhancementCost} pts)`);
      if (enhancement.description) {
        lines.push(`  - ${enhancement.description}`);
      }
    });

    lines.push('');
  }

  return lines.join('\n');
};
