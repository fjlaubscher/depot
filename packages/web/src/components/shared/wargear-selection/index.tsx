import React, { useMemo } from 'react';
import type { depot } from '@depot/core';
import WargearSection from './wargear-section';
import { separateWargearByType } from '@depot/core/utils/wargear';

interface WargearSelectionProps {
  wargear: depot.Wargear[];
  selectedWargear: depot.Wargear[];
  onSelectionChange: (wargear: depot.Wargear, selected: boolean) => void;
}

const WargearSelection: React.FC<WargearSelectionProps> = ({
  wargear,
  selectedWargear,
  onSelectionChange
}) => {
  const { rangedWargear, meleeWargear, mixedWargear } = useMemo(() => {
    return separateWargearByType(wargear);
  }, [wargear]);

  if (wargear.length === 0) {
    return (
      <div className="text-center py-8" data-testid="no-wargear-available">
        <p className="text-subtle">No wargear available for this unit.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5" data-testid="wargear-table">
      <WargearSection
        wargear={rangedWargear}
        title="Ranged"
        selectedWargear={selectedWargear}
        onSelectionChange={onSelectionChange}
      />
      <WargearSection
        wargear={mixedWargear}
        title="Mixed"
        selectedWargear={selectedWargear}
        onSelectionChange={onSelectionChange}
      />
      <WargearSection
        wargear={meleeWargear}
        title="Melee"
        selectedWargear={selectedWargear}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
};

export default WargearSelection;
