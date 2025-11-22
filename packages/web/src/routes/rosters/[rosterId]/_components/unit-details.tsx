import React from 'react';
import { Link } from 'react-router-dom';
import type { depot } from '@depot/core';

import { DatasheetProfile } from '@/components/shared/datasheet';

interface UnitDetailsProps {
  unit: depot.RosterUnit;
}

const UnitDetails: React.FC<UnitDetailsProps> = ({ unit }) => {
  return (
    <div className="border-t border-subtle surface-muted p-4">
      <div className="flex flex-col gap-4">
        <DatasheetProfile
          datasheet={unit.datasheet}
          factionDatasheets={[]}
          abilitiesTestId="roster-unit-abilities"
          compact
          showLeaderRules={false}
          showWargear={false}
        />

        <div className="pt-2 border-t border-subtle">
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
