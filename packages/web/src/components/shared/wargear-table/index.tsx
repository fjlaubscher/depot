import React, { useMemo } from 'react';
import { depot } from '@depot/core';
import WargearSection from './wargear-section';

interface WargearTableProps {
  wargear: depot.Wargear[];
  showSelectionColumn?: boolean;
  selectedWargear?: depot.Wargear[];
  onSelectionChange?: (wargear: depot.Wargear, selected: boolean) => void;
  className?: string;
}

const WargearTable: React.FC<WargearTableProps> = ({
  wargear,
  showSelectionColumn = false,
  selectedWargear = [],
  onSelectionChange,
  className
}) => {
  const groupedWargear = useMemo(() => {
    const ranged: depot.Wargear[] = [];
    const melee: depot.Wargear[] = [];

    wargear.forEach((weapon) => {
      if (weapon.type === 'Ranged') {
        ranged.push(weapon);
      } else if (weapon.type === 'Melee') {
        melee.push(weapon);
      }
    });

    return { ranged, melee };
  }, [wargear]);

  if (wargear.length === 0) {
    return (
      <div className="text-center py-8" data-testid="no-wargear-available">
        <p className="text-gray-500 dark:text-gray-400">No wargear available for this unit.</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 ${className || ''}`} data-testid="wargear-table">
      <WargearSection
        wargear={groupedWargear.ranged}
        title="Ranged Wargear"
        isRanged={true}
        showSelectionColumn={showSelectionColumn}
        selectedWargear={selectedWargear}
        onSelectionChange={onSelectionChange}
      />
      <WargearSection
        wargear={groupedWargear.melee}
        title="Melee Wargear"
        isRanged={false}
        showSelectionColumn={showSelectionColumn}
        selectedWargear={selectedWargear}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
};

export default WargearTable;
