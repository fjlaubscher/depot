import React from 'react';
import type { depot } from '@depot/core';
import WargearRow from './wargear-row';

interface WargearSectionProps {
  wargear: depot.Wargear[];
  title: string;
  isRanged: boolean;
  showSelectionColumn?: boolean;
  selectedWargear?: depot.Wargear[];
  onSelectionChange?: (wargear: depot.Wargear, selected: boolean) => void;
}

const WargearSection: React.FC<WargearSectionProps> = ({
  wargear,
  title,
  isRanged,
  showSelectionColumn = false,
  selectedWargear = [],
  onSelectionChange
}) => {
  if (wargear.length === 0) return null;

  const isSimplified = showSelectionColumn && !!onSelectionChange;

  return (
    <div
      className="flex flex-col gap-3"
      data-testid={`${title.toLowerCase().replace(/\s+/g, '-')}-section`}
    >
      <h4 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h4>
      <div className="flex flex-col gap-2">
        {wargear.map((weapon) => {
          const rowData = WargearRow({
            weapon,
            isRanged,
            showSelectionColumn,
            selectedWargear,
            onSelectionChange
          });

          const handleCardClick = () => {
            if (showSelectionColumn && onSelectionChange) {
              const isSelected = selectedWargear.some(
                (selected) => selected.name === weapon.name && selected.line === weapon.line
              );
              onSelectionChange(weapon, !isSelected);
            }
          };

          return (
            <div
              key={`${weapon.line}-${weapon.name}`}
              className={`flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/30 rounded hover:bg-gray-100/80 dark:hover:bg-gray-600/40 transition-colors ${
                showSelectionColumn ? 'cursor-pointer' : ''
              }`}
              onClick={handleCardClick}
            >
              {showSelectionColumn && <div className="flex-shrink-0">{rowData.selected}</div>}
              <div className="flex-grow flex flex-col gap-1">
                <div className="font-medium text-gray-900 dark:text-white capitalize">
                  {rowData.name}
                </div>
                {!isSimplified && (
                  <div
                    className={`grid gap-2 text-xs text-gray-500 dark:text-gray-400 ${isRanged ? 'grid-cols-6' : 'grid-cols-5'}`}
                  >
                    {isRanged && (
                      <div className="text-center">
                        <div className="font-medium">Range</div>
                        <div>{rowData.range}</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="font-medium">A</div>
                      <div>{rowData.a}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{isRanged ? 'BS' : 'WS'}</div>
                      <div>{rowData.skill}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">S</div>
                      <div>{rowData.s}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">AP</div>
                      <div>{rowData.ap}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">D</div>
                      <div>{rowData.d}</div>
                    </div>
                  </div>
                )}
                {rowData.keywords && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">{rowData.keywords}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WargearSection;
