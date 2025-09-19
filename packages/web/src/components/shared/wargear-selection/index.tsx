import React, { useMemo } from 'react';
import { depot } from '@depot/core';
import WargearSection from './wargear-section';
import { separateWargearByType } from '@/utils/wargear';

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
  const { rangedWargear, meleeWargear } = useMemo(() => {
    return separateWargearByType(wargear);
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
        wargear={rangedWargear}
        title="Ranged Wargear"
        isRanged={true}
        showSelectionColumn={showSelectionColumn}
        selectedWargear={selectedWargear}
        onSelectionChange={onSelectionChange}
      />
      <WargearSection
        wargear={meleeWargear}
        title="Melee Wargear"
        isRanged={false}
        showSelectionColumn={showSelectionColumn}
        selectedWargear={selectedWargear}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
};

export default WargearSelection;
