import React from 'react';
import type { depot } from '@depot/core';
import { SelectField } from '@/components/ui';
import { formatModelCostOptions } from '@depot/core/utils/model-costs';

interface ModelCostSelectionProps {
  /** Already filtered to the rows that apply to this unit (see `modelCostsForOrdinal`); the shell only renders this with 2+ rows. */
  modelCosts: depot.ModelCost[];
  selectedModelCost: depot.ModelCost;
  onModelCostChange: (modelCost: depot.ModelCost) => void;
}

const ModelCostSelection: React.FC<ModelCostSelectionProps> = ({
  modelCosts,
  selectedModelCost,
  onModelCostChange
}) => (
  <SelectField
    // The "Unit size" section rule sits directly above, so a label would repeat it.
    aria-label="Unit size"
    value={selectedModelCost?.line || ''}
    onChange={(event) => {
      const selectedCost = modelCosts.find((cost) => cost.line === event.target.value);
      if (selectedCost) onModelCostChange(selectedCost);
    }}
    options={formatModelCostOptions(modelCosts).map(({ cost, label }) => ({
      value: cost.line,
      label
    }))}
    placeholder="Select unit size"
    data-testid="model-cost-select"
  />
);

export default ModelCostSelection;
