import React from 'react';
import { Link } from 'react-router-dom';
import { depot } from '@depot/core';

import ModelStatsRow from '@/components/shared/model-stats-row';
import { categorizeAbilities } from '@/pages/datasheet/utils/abilities';

interface UnitDetailsProps {
  unit: depot.RosterUnit;
}

const UnitDetails: React.FC<UnitDetailsProps> = ({ unit }) => {
  const { inline: inlineAbilities } = categorizeAbilities(unit.datasheet.abilities);
  const models = unit.datasheet.models;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col gap-4">
        {/* Models Section */}
        {models.length > 0 && (
          <div className="flex flex-col gap-3">
            {models.map((model) => (
              <ModelStatsRow key={model.line} model={model} variant="compact" />
            ))}
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
            to={`/datasheet/${unit.datasheet.id}`}
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
