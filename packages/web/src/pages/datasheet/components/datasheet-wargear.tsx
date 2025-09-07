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
    <div className="flex flex-col md:flex-row md:items-start gap-4">
      {/* Ranged Weapons */}
      {rangedWargear.length > 0 ? (
        <CollapsibleSection title="Ranged Wargear" className="flex-1">
          <div className="flex flex-col gap-4">
            {rangedWargear.map((wargear) => (
              <WargearStatsRow key={wargear.line} wargear={wargear} type="Ranged" />
            ))}
          </div>
        </CollapsibleSection>
      ) : null}

      {/* Melee Weapons */}
      {meleeWargear.length > 0 && (
        <CollapsibleSection title="Melee Wargear" className="flex-1">
          <div className="flex flex-col gap-4">
            {meleeWargear.map((wargear) => (
              <WargearStatsRow key={wargear.line} wargear={wargear} type="Melee" />
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

export default DatasheetWargear;
