import React from 'react';
import { Link } from 'react-router-dom';
import type { depot } from '@depot/core';

import ModelStatsRow from '@/components/shared/model-stats-row';
import { WargearTable, DatasheetAbilities } from '@/components/shared';
import { categorizeAbilities } from '@/utils/abilities';

interface UnitDetailsProps {
  unit: depot.RosterUnit;
}

const UnitDetails: React.FC<UnitDetailsProps> = ({ unit }) => {
  const { inline: inlineAbilities } = categorizeAbilities(unit.datasheet.abilities);
  const models = unit.datasheet.models;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
      <div className="flex flex-col gap-2">
        {/* Models Section */}
        {models.length > 0 && (
          <div className="flex flex-col gap-2">
            {models.map((model) => (
              <ModelStatsRow key={model.line} model={model} variant="compact" />
            ))}
          </div>
        )}

        {/* Selected Wargear */}
        {unit.selectedWargear.length > 0 && (
          <WargearTable wargear={unit.selectedWargear} title="Selected Wargear" type="Mixed" />
        )}

        {/* Unit Abilities */}
        <DatasheetAbilities
          title="Unit Abilities"
          abilities={inlineAbilities}
          dataTestId="roster-unit-abilities"
        />

        {/* Quick Link to Full Datasheet */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <Link
            to={`/faction/${unit.datasheet.factionSlug}/datasheet/${
              unit.datasheetSlug ?? unit.datasheet.slug
            }`}
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
