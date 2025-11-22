import React from 'react';
import type { depot } from '@depot/core';
import WargearRow from './wargear-row';

interface WargearSectionProps {
  wargear: depot.Wargear[];
  title: string;
  showSelectionColumn?: boolean;
  selectedWargear?: depot.Wargear[];
  onSelectionChange?: (wargear: depot.Wargear, selected: boolean) => void;
}

const WargearSection: React.FC<WargearSectionProps> = ({
  wargear,
  title,
  showSelectionColumn = false,
  selectedWargear = [],
  onSelectionChange
}) => {
  if (wargear.length === 0) return null;

  return (
    <div
      className="flex flex-col gap-2"
      data-testid={`${title.toLowerCase().replace(/\s+/g, '-')}-section`}
    >
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {wargear.map((weapon) => (
          <WargearRow
            key={weapon.id}
            weapon={weapon}
            showSelectionColumn={showSelectionColumn}
            selectedWargear={selectedWargear}
            onSelectionChange={onSelectionChange}
          />
        ))}
      </div>
    </div>
  );
};

export default WargearSection;
