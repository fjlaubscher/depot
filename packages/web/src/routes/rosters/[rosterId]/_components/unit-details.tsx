import React from 'react';
import type { depot } from '@depot/core';

import { RosterUnitProfilePanel } from '@/components/shared/roster';

interface UnitDetailsProps {
  unit: depot.RosterUnit;
}

const UnitDetails: React.FC<UnitDetailsProps> = ({ unit }) => {
  return (
    <RosterUnitProfilePanel
      unit={unit}
      abilitiesTestId="roster-unit-abilities"
      showViewDatasheetLink
    />
  );
};

export default UnitDetails;
