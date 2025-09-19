import React, { useMemo } from 'react';
import classNames from 'classnames';
import { depot } from '@depot/core';
import { Tag, TagGroup } from '@/components/ui';
import { parseWargearKeywords } from '@/utils/wargear';

interface WargearTableProps {
  wargear: depot.Wargear[];
  title: string;
  type: 'Ranged' | 'Melee' | 'Mixed';
}

const WargearTable: React.FC<WargearTableProps> = ({ wargear, title, type }) => {
  if (wargear.length === 0) {
    return null;
  }

  const wargearKeywordLookup = useMemo(
    () =>
      wargear.reduce(
        (acc, curr) => {
          const keywords = parseWargearKeywords(curr.description);
          return { ...acc, [curr.line]: keywords };
        },
        {} as Record<string, string[]>
      ),
    [wargear]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-1 font-medium text-primary-600">{title}</th>
              <th className="text-center py-1 font-medium text-primary-600">Range</th>
              <th className="text-center py-1 font-medium text-primary-600">A</th>
              <th className="text-center py-1 font-medium text-primary-600">
                {type === 'Ranged' ? 'BS' : type === 'Melee' ? 'WS' : 'BS/WS'}
              </th>
              <th className="text-center py-1 font-medium text-primary-600">S</th>
              <th className="text-center py-1 font-medium text-primary-600">AP</th>
              <th className="text-center py-1 font-medium text-primary-600">D</th>
            </tr>
          </thead>
          <tbody>
            {wargear.map((weapon, index) => {
              const keywords = wargearKeywordLookup[weapon.line];
              const hasKeywords = keywords.length > 0;

              const statCellClasses = `${hasKeywords ? 'pt-1' : 'py-2'} text-gray-700 dark:text-white`;

              return (
                <React.Fragment key={index}>
                  <tr
                    className={
                      !hasKeywords ? 'border-b border-gray-100 dark:border-gray-800' : undefined
                    }
                  >
                    <td className={classNames(statCellClasses, 'capitalize')}>{weapon.name}</td>
                    <td className={classNames(statCellClasses, 'text-center')}>
                      {weapon.type === 'Melee' ? '-' : weapon.range || '-'}
                    </td>
                    <td className={classNames(statCellClasses, 'text-center')}>{weapon.a}</td>
                    <td className={classNames(statCellClasses, 'text-center')}>
                      {weapon.bsWs === 'N/A' ? weapon.bsWs : `${weapon.bsWs}+`}
                    </td>
                    <td className={classNames(statCellClasses, 'text-center')}>{weapon.s}</td>
                    <td className={classNames(statCellClasses, 'text-center')}>{weapon.ap}</td>
                    <td className={classNames(statCellClasses, 'text-center')}>{weapon.d}</td>
                  </tr>
                  {hasKeywords ? (
                    <tr className="pb-2 border-b border-gray-200 dark:border-gray-700">
                      <td colSpan={7} className="py-1">
                        <TagGroup spacing="sm">
                          {keywords.map((keyword, keywordIndex) => (
                            <Tag
                              key={keywordIndex}
                              variant="secondary"
                              size="sm"
                              className="capitalize"
                            >
                              {keyword}
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
