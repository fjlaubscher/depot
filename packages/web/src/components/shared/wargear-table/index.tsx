import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { depot } from '@depot/core';
import { Tag, TagGroup } from '@/components/ui';
import { parseWargearKeywords } from '@/utils/wargear';

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
  if (wargear.length === 0) {
    return null;
  }

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

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full text-xs table-fixed">
          <thead>
            <tr className="border-b border-subtle">
              <th className="text-left py-1 font-semibold text-primary-600 dark:text-primary-400 w-2/5 md:w-3/5">
                {title}
              </th>
              <th className="text-center py-1 font-semibold text-primary-600 dark:text-primary-400">
                Range
              </th>
              <th className="text-center py-1 font-semibold text-primary-600 dark:text-primary-400">
                A
              </th>
              <th className="text-center py-1 font-semibold text-primary-600 dark:text-primary-400">
                {type === 'Ranged' ? 'BS' : type === 'Melee' ? 'WS' : 'BS/WS'}
              </th>
              <th className="text-center py-1 font-semibold text-primary-600 dark:text-primary-400">
                S
              </th>
              <th className="text-center py-1 font-semibold text-primary-600 dark:text-primary-400">
                AP
              </th>
              <th className="text-center py-1 font-semibold text-primary-600 dark:text-primary-400">
                D
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const hasKeywords = row.keywords.length > 0;
              const statCellClasses = `${hasKeywords ? 'pt-1' : 'py-2'} text-gray-700 dark:text-white`;

              return (
                <React.Fragment key={row.key}>
                  <tr
                    className={
                      !hasKeywords ? 'border-b border-gray-100 dark:border-gray-800' : undefined
                    }
                  >
                    <td className={classNames(statCellClasses, 'capitalize')}>{row.name}</td>
                    <td className={classNames(statCellClasses, 'text-center')}>{row.range}</td>
                    <td className={classNames(statCellClasses, 'text-center')}>{row.attacks}</td>
                    <td className={classNames(statCellClasses, 'text-center')}>{row.skill}</td>
                    <td className={classNames(statCellClasses, 'text-center')}>{row.strength}</td>
                    <td className={classNames(statCellClasses, 'text-center')}>{row.ap}</td>
                    <td className={classNames(statCellClasses, 'text-center')}>{row.damage}</td>
                  </tr>
                  {hasKeywords ? (
                    <tr className="pb-2 border-b border-subtle">
                      <td colSpan={7} className="py-1">
                        <TagGroup spacing="sm">
                          {row.keywords.map((keyword, keywordIndex) => (
                            <Tag
                              key={`${row.key}-kw-${keywordIndex}`}
                              variant="default"
                              size="sm"
                              className="capitalize"
                            >
                              {keyword.toLowerCase()}
                            </Tag>
                          ))}
                        </TagGroup>
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WargearTable;
