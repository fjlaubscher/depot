import React from 'react';
import type { depot } from '@depot/core';
import WargearSelection from '@/components/shared/wargear-selection';

interface WargearSelectionContainerProps {
  unit: depot.RosterUnit;
  selectedWargear: depot.Wargear[];
  onWargearChange: (wargear: depot.Wargear[]) => void;
}

const WargearSelectionContainer: React.FC<WargearSelectionContainerProps> = ({
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
        <p className="text-subtle">No wargear available for this unit.</p>
      </div>
    );
  }

  return (
    <WargearSelection
      wargear={unit.datasheet.wargear}
      showSelectionColumn={true}
      selectedWargear={selectedWargear}
      onSelectionChange={handleSelectionChange}
    />
  );
};

export default WargearSelectionContainer;
