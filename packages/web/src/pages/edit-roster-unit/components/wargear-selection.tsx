import React from 'react';
import { depot } from '@depot/core';
import WargearTable from '@/components/shared/wargear-table';

interface WargearSelectionProps {
  unit: depot.RosterUnit;
  selectedWargear: depot.Wargear[];
  onWargearChange: (wargear: depot.Wargear[]) => void;
}

const WargearSelection: React.FC<WargearSelectionProps> = ({
  unit,
  selectedWargear,
  onWargearChange
}) => {
  const handleSelectionChange = (wargear: depot.Wargear, selected: boolean) => {
    if (selected) {
      onWargearChange([...selectedWargear, wargear]);
    } else {
      onWargearChange(
        selectedWargear.filter(
          (selected) => !(selected.name === wargear.name && selected.line === wargear.line)
        )
      );
    }
  };

  const hasWargear = unit.datasheet.wargear.length > 0;

  if (!hasWargear) {
    return (
      <div className="text-center py-8" data-testid="no-wargear-available">
        <p className="text-gray-500 dark:text-gray-400">No wargear available for this unit.</p>
      </div>
    );
  }

  return (
    <WargearTable
      wargear={unit.datasheet.wargear}
      showSelectionColumn={true}
      selectedWargear={selectedWargear}
      onSelectionChange={handleSelectionChange}
    />
  );
};

export default WargearSelection;
