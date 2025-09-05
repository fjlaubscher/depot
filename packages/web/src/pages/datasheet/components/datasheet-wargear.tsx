import React, { useMemo } from 'react';
import { depot } from '@depot/core';
import { CollapsibleSection } from '@/components/ui';
import WargearStatsRow from './wargear-stats-row';

interface DatasheetWargearProps {
  datasheet: depot.Datasheet;
}

const DatasheetWargear: React.FC<DatasheetWargearProps> = ({ datasheet }) => {
  const { wargear } = datasheet;

  const { rangedWargear, meleeWargear } = useMemo(() => {
    const ranged: depot.Wargear[] = [];
    const melee: depot.Wargear[] = [];

    wargear.forEach((weapon) => {
      if (weapon.type === 'Ranged') {
        ranged.push(weapon);
      } else if (weapon.type === 'Melee') {
        melee.push(weapon);
      }
    });

    return { rangedWargear: ranged, meleeWargear: melee };
  }, [wargear]);

  return (
    <div className="flex flex-col gap-6">
      {/* Ranged Weapons */}
      {rangedWargear.length > 0 ? (
        <CollapsibleSection title="Ranged Wargear">
          {rangedWargear.map((wargear) => (
            <WargearStatsRow key={wargear.line} wargear={wargear} type="ranged" />
          ))}
        </CollapsibleSection>
      ) : null}

      {/* Melee Weapons */}
      {meleeWargear.length > 0 && (
        <CollapsibleSection title="Melee Wargear">
          {meleeWargear.map((wargear) => (
            <WargearStatsRow key={wargear.line} wargear={wargear} type="melee" />
          ))}
        </CollapsibleSection>
      )}
    </div>
  );
};

export default DatasheetWargear;
