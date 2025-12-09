import React, { useMemo } from 'react';
import type { depot } from '@depot/core';
import WargearSection from './wargear-section';
import { separateWargearByType } from '@depot/core/utils/wargear';

interface WargearSelectionProps {
  wargear: depot.Wargear[];
  showSelectionColumn?: boolean;
  selectedWargear?: depot.Wargear[];
  onSelectionChange?: (wargear: depot.Wargear, selected: boolean) => void;
  className?: string;
}

const WargearSelection: React.FC<WargearSelectionProps> = ({
  wargear,
  showSelectionColumn = false,
  selectedWargear = [],
  onSelectionChange,
  className
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
    <div className={`flex flex-col gap-4 ${className || ''}`} data-testid="wargear-table">
      <WargearSection
        wargear={rangedWargear}
        title="Ranged Wargear"
        showSelectionColumn={showSelectionColumn}
        selectedWargear={selectedWargear}
        onSelectionChange={onSelectionChange}
      />
      <WargearSection
        wargear={mixedWargear}
        title="Mixed Wargear"
        showSelectionColumn={showSelectionColumn}
        selectedWargear={selectedWargear}
        onSelectionChange={onSelectionChange}
      />
      <WargearSection
        wargear={meleeWargear}
        title="Melee Wargear"
        showSelectionColumn={showSelectionColumn}
        selectedWargear={selectedWargear}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
};

export default WargearSelection;
