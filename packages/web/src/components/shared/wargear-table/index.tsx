import React, { useMemo } from 'react';
import { cx } from '@/utils/cx';
import type { depot } from '@depot/core';
import { parseWargearKeywords } from '@depot/core/utils/wargear';

interface WargearTableProps {
  wargear: depot.Wargear[];
  title: string;
  type: 'Ranged' | 'Melee' | 'Mixed';
}

interface TableRow {
  key: string;
  name: string;
  range: string;
  attacks: string;
  skill: string;
  strength: string;
  ap: string;
  damage: string;
  keywords: string[];
}

// Fixed mono columns so the numbers align down the table and never wrap at
// 375px — only the weapon name is allowed to reflow. Widths come from the
// token sheet's weapon-grid spec.
const STAT_COLUMNS = [36, 24, 26, 22, 26, 24];

const buildProfileLabel = (weapon: depot.Wargear, profile: depot.WargearProfile): string => {
  if (weapon.profiles.length === 1) {
    return weapon.name;
  }

  if (profile.profileName) {
    return `${weapon.name} – ${profile.profileName}`;
  }

  if (profile.name && profile.name !== weapon.name) {
    return profile.name;
  }

  return `${weapon.name} (${profile.type})`;
};

const WargearTable: React.FC<WargearTableProps> = ({ wargear, title, type }) => {
  const rows = useMemo<TableRow[]>(
    () =>
      wargear.flatMap((weapon) =>
        weapon.profiles.map((profile, index) => {
          const name = buildProfileLabel(weapon, profile);
          const statsKey = `${weapon.id}-${profile.line ?? index}`;
          const keywords = parseWargearKeywords(profile.description);
          const isMelee = profile.type === 'Melee';

          return {
            key: statsKey,
            name,
            range: isMelee ? '–' : profile.range ? `${profile.range}"` : '–',
            attacks: profile.a || '–',
            skill: profile.bsWs === 'N/A' ? profile.bsWs : `${profile.bsWs}+`,
            strength: profile.s || '–',
            ap: profile.ap || '–',
            damage: profile.d || '–',
            keywords
          };
        })
      ),
    [wargear]
  );

  if (wargear.length === 0) {
    return null;
  }

  const skillLabel = type === 'Ranged' ? 'BS' : type === 'Melee' ? 'WS' : 'BS/WS';
  const headers = ['Range', 'A', skillLabel, 'S', 'AP', 'D'];

  return (
    <table className="w-full table-fixed border-collapse">
      <colgroup>
        <col />
        {STAT_COLUMNS.map((width, index) => (
          <col key={`col-${index}`} style={{ width }} />
        ))}
      </colgroup>
      <thead>
        <tr className="border-b border-border-subtle">
          <th className="type-section py-1 pr-2 text-left">{title}</th>
          {headers.map((header) => (
            <th key={header} className="type-section py-1 text-center">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-b border-border-subtle align-top">
            <td className="py-1.5 pr-2">
              <div className="text-xs font-bold capitalize text-foreground">{row.name}</div>
              {row.keywords.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {row.keywords.map((keyword, keywordIndex) => (
                    <span
                      key={`${row.key}-kw-${keywordIndex}`}
                      className="tag-keyword border-border-accent bg-surface-accent text-accent"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : null}
            </td>
            {[row.range, row.attacks, row.skill, row.strength, row.ap, row.damage].map(
              (value, index) => (
                <td
                  key={`${row.key}-stat-${index}`}
                  className={cx(
                    'py-1.5 text-center font-mono text-xs font-bold tabular-nums',
                    'whitespace-nowrap text-foreground'
                  )}
                >
                  {value}
                </td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default WargearTable;
