import React from 'react';
import { Link } from 'react-router-dom';
import { depot } from '@depot/core';

import ModelStatsRow from '@/components/shared/model-stats-row';
import { Tag, TagGroup } from '@/components/ui';
import { parseWargearKeywords } from '@/utils/wargear';
import { categorizeAbilities } from '@/pages/datasheet/utils/abilities';

interface UnitDetailsProps {
  unit: depot.RosterUnit;
}

const UnitDetails: React.FC<UnitDetailsProps> = ({ unit }) => {
  const { inline: inlineAbilities } = categorizeAbilities(unit.datasheet.abilities);
  const models = unit.datasheet.models;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
      <div className="flex flex-col gap-4">
        {/* Models Section */}
        {models.length > 0 && (
          <div className="flex flex-col gap-3">
            {models.map((model) => (
              <ModelStatsRow key={model.line} model={model} variant="compact" />
            ))}
          </div>
        )}

        {/* Selected Wargear */}
        {unit.selectedWargear.length > 0 && (
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Selected Wargear
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 font-medium text-gray-900 dark:text-white">
                      Name
                    </th>
                    <th className="text-center py-2 font-medium text-gray-900 dark:text-white">
                      Range
                    </th>
                    <th className="text-center py-2 font-medium text-gray-900 dark:text-white">
                      A
                    </th>
                    <th className="text-center py-2 font-medium text-gray-900 dark:text-white">
                      BS/WS
                    </th>
                    <th className="text-center py-2 font-medium text-gray-900 dark:text-white">
                      S
                    </th>
                    <th className="text-center py-2 font-medium text-gray-900 dark:text-white">
                      AP
                    </th>
                    <th className="text-center py-2 font-medium text-gray-900 dark:text-white">
                      D
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {unit.selectedWargear.map((weapon, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 text-gray-900 dark:text-white capitalize">
                          {weapon.name}
                        </td>
                        <td className="py-2 text-center text-gray-700 dark:text-gray-300">
                          {weapon.range === 'Melee' ? '-' : weapon.range || '-'}
                        </td>
                        <td className="py-2 text-center text-gray-700 dark:text-gray-300">
                          {weapon.a}
                        </td>
                        <td className="py-2 text-center text-gray-700 dark:text-gray-300">
                          {weapon.bsWs}
                        </td>
                        <td className="py-2 text-center text-gray-700 dark:text-gray-300">
                          {weapon.s}
                        </td>
                        <td className="py-2 text-center text-gray-700 dark:text-gray-300">
                          {weapon.ap}
                        </td>
                        <td className="py-2 text-center text-gray-700 dark:text-gray-300">
                          {weapon.d}
                        </td>
                      </tr>
                      {(() => {
                        const keywords = parseWargearKeywords(weapon.description);
                        return keywords.length > 0 ? (
                          <tr className="border-b border-gray-100 dark:border-gray-800">
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
                        ) : null;
                      })()}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Unit Abilities */}
        {inlineAbilities.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Unit Abilities</h4>
            <div className="space-y-1">
              {inlineAbilities.slice(0, 3).map((ability, index) => (
                <div key={index} className="text-sm bg-white dark:bg-gray-800 p-2 rounded">
                  <span className="font-medium text-gray-900 dark:text-white">{ability.name}:</span>{' '}
                  <span
                    className="text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{
                      __html:
                        ability.description.length > 100
                          ? ability.description.substring(0, 100) + '...'
                          : ability.description
                    }}
                  />
                </div>
              ))}
              {inlineAbilities.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                  +{inlineAbilities.length - 3} more abilities
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Link to Full Datasheet */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <Link
            to={`/faction/${unit.datasheet.factionId}/datasheet/${unit.datasheet.id}`}
            className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            View Full Datasheet →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnitDetails;
