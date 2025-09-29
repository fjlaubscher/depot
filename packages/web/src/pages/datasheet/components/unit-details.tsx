import React from 'react';
import type { depot } from '@depot/core';

// components
import Card from '@/components/ui/card';

interface UnitDetailsProps {
  datasheet: depot.Datasheet;
}

const UnitDetails: React.FC<UnitDetailsProps> = ({ datasheet }) => {
  const { options, unitComposition } = datasheet;
  const hasComposition = unitComposition.length > 0;
  const hasOptions = options.length > 0;

  if (!hasComposition && !hasOptions) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Unit Options */}
      {hasOptions && (
        <div data-testid="unit-options">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Unit Options</h4>
          <Card className="p-4">
            <ul className="space-y-2 list-disc pl-4">
              {options.map((option) => (
                <li
                  key={`unit-option-${option.line}`}
                  className="text-sm text-gray-700 dark:text-gray-300 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mt-1"
                  dangerouslySetInnerHTML={{ __html: option.description }}
                />
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UnitDetails;
