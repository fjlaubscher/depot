import React, { useState } from 'react';
import { depot } from '@depot/core';
import { Plus, Check } from 'lucide-react';
import { Button, Card, SelectField } from '@/components/ui';

interface DatasheetSelectionCardProps {
  datasheet: depot.Datasheet;
  onSelect: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
  isSelected?: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => boolean;
  buttonText?: string;
  selectedButtonText?: string;
  showSelectionState?: boolean;
}

export const DatasheetSelectionCard: React.FC<DatasheetSelectionCardProps> = ({
  datasheet,
  onSelect,
  isSelected,
  buttonText = 'Add',
  selectedButtonText = 'Selected',
  showSelectionState = true
}) => {
  const [selectedModelCostIndex, setSelectedModelCostIndex] = useState(0);
  const selectedModelCost = datasheet.modelCosts[selectedModelCostIndex];

  const modelCostOptions = datasheet.modelCosts.map((cost, index) => ({
    value: index.toString(),
    label: `${cost.description} - ${cost.cost} pts`
  }));

  const unitIsSelected = selectedModelCost && isSelected?.(datasheet, selectedModelCost);

  return (
    <Card
      padding="sm"
      className={
        showSelectionState && unitIsSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">{datasheet.name}</h4>

          {datasheet.modelCosts.length > 1 ? (
            <SelectField
              value={selectedModelCostIndex.toString()}
              onChange={(e) => setSelectedModelCostIndex(parseInt(e.target.value, 10))}
              options={modelCostOptions}
            />
          ) : (
            selectedModelCost && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedModelCost.description} - {selectedModelCost.cost} pts
              </p>
            )
          )}
        </div>

        <Button
          size="sm"
          variant={showSelectionState && unitIsSelected ? 'secondary' : 'default'}
          onClick={() => {
            if (selectedModelCost) {
              onSelect(datasheet, selectedModelCost);
            }
          }}
          disabled={!selectedModelCost}
        >
          {showSelectionState && unitIsSelected ? (
            <>
              <Check size={16} className="mr-1" />
              {selectedButtonText}
            </>
          ) : (
            <>
              <Plus size={16} className="mr-1" />
              {buttonText}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
