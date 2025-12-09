import React, { useMemo } from 'react';
import type { depot } from '@depot/core';
import { CollapsibleSection, Card } from '@/components/ui';
import WargearTable from '@/components/shared/wargear-table';
import { separateWargearByType } from '@depot/core/utils/wargear';

interface DatasheetWargearProps {
  datasheet: depot.Datasheet;
}

const DatasheetWargear: React.FC<DatasheetWargearProps> = ({ datasheet }) => {
  const { wargear, options } = datasheet;

  const { rangedWargear, meleeWargear, mixedWargear } = useMemo(() => {
    return separateWargearByType(wargear);
  }, [wargear]);

  const hasOptions = useMemo(
    () => (options.length > 0 ? options[0].description !== 'None' : false),
    [options]
  );
  const hasWargear = wargear.length > 0;

  if (!hasWargear && !hasOptions) {
    return null;
  }

  return (
    <CollapsibleSection title="Wargear & Options" defaultExpanded={false} className="w-full">
      <div className="flex flex-col gap-4">
        {/* Unit Options */}
        {hasOptions && (
          <div data-testid="unit-options">
            <h4 className="text-sm font-semibold text-foreground mb-3">Unit Options</h4>
            <Card className="p-4">
              <ul className="space-y-2 list-disc pl-4">
                {options.map((option) => (
                  <li
                    key={`unit-option-${option.line}`}
                    className="text-sm text-body [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mt-1"
                    dangerouslySetInnerHTML={{ __html: option.description }}
                  />
                ))}
              </ul>
            </Card>
          </div>
        )}

        {/* Wargear Tables */}
        {hasWargear && (
          <div className="flex flex-col gap-4">
            <WargearTable wargear={rangedWargear} title="Ranged Wargear" type="Ranged" />
            <WargearTable wargear={mixedWargear} title="Mixed Wargear" type="Mixed" />
            <WargearTable wargear={meleeWargear} title="Melee Wargear" type="Melee" />
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default DatasheetWargear;
