import React from 'react';
import { depot } from '@depot/core';
import { SelectField } from '@/components/ui';

interface ModelCostSelectionProps {
  unit: depot.RosterUnit;
  selectedModelCost: depot.ModelCost;
  onModelCostChange: (modelCost: depot.ModelCost) => void;
}

const ModelCostSelection: React.FC<ModelCostSelectionProps> = ({
  unit,
  selectedModelCost,
  onModelCostChange
}) => {
  const availableModelCosts = unit.datasheet.modelCosts;

  if (availableModelCosts.length === 0) {
    return (
      <div className="text-center py-8" data-testid="no-model-costs-available">
        <p className="text-gray-500 dark:text-gray-400">
          No unit size options available for this unit.
        </p>
      </div>
    );
  }

  if (availableModelCosts.length === 1) {
    const singleCost = availableModelCosts[0];
    return (
      <div className="flex flex-col gap-2" data-testid="single-model-cost">
        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <span className="text-gray-900 dark:text-white">{singleCost.description}</span>
          <span className="font-medium text-gray-900 dark:text-white">{singleCost.cost} pts</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This unit has only one size option available.
        </p>
      </div>
    );
  }

  const modelCostOptions = availableModelCosts.map((cost) => ({
    value: cost.line,
    label: `${cost.description} (${cost.cost} pts)`
  }));

  const currentValue = selectedModelCost?.line || '';

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLine = event.target.value;
    const selectedCost = availableModelCosts.find((cost) => cost.line === selectedLine);

    if (selectedCost) {
      onModelCostChange(selectedCost);
    }
  };

  return (
    <div className="flex flex-col gap-4" data-testid="model-cost-selection">
      <SelectField
        label="Unit Size"
        value={currentValue}
        onChange={handleChange}
        options={modelCostOptions}
        placeholder="Select unit size"
        data-testid="model-cost-select"
      />

      {/* Show current selection details */}
      {selectedModelCost && (
        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-900 dark:text-white">
              Selected Configuration
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedModelCost.description}
            </span>
          </div>
          <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
            {selectedModelCost.cost} pts
          </span>
        </div>
      )}

      {/* Show all available options for reference */}
      <div className="flex flex-col gap-2">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Options:</h5>
        <div className="flex flex-col gap-1">
          {availableModelCosts.map((cost, index) => (
            <div
              key={`${cost.line}-${index}`}
              className={`flex items-center justify-between p-2 text-sm rounded ${
                selectedModelCost?.line === cost.line
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              data-testid={`model-cost-option-${cost.line}`}
            >
              <span>{cost.description}</span>
              <span className="font-medium">{cost.cost} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelCostSelection;
