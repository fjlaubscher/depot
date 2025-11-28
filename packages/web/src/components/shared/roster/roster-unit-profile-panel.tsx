import type { FC } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';
import type { depot } from '@depot/core';

import RosterUnitProfile from './roster-unit-profile';

interface RosterUnitProfilePanelProps {
  unit: depot.RosterUnit;
  abilitiesTestId?: string;
  showViewDatasheetLink?: boolean;
}

const RosterUnitProfilePanel: FC<RosterUnitProfilePanelProps> = ({
  unit,
  abilitiesTestId,
  showViewDatasheetLink = false
}) => {
  return (
    <div className="border-t border-subtle surface-muted p-4">
      <div className="flex flex-col gap-4">
        <RosterUnitProfile unit={unit} abilitiesTestId={abilitiesTestId} />

        {showViewDatasheetLink ? (
          <div>
            <Link
              to={`/faction/${unit.datasheet.factionSlug}/datasheet/${
                unit.datasheetSlug ?? unit.datasheet.slug
              }`}
              className="inline-flex items-center text-sm text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              View Full Datasheet →
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RosterUnitProfilePanel;
