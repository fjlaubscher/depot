import React from 'react';
import type { depot } from '@depot/core';
import { SelectField } from '@/components/ui';
import { formatModelCostLabel } from '@depot/core/utils/model-costs';

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
    label="Unit Size"
    value={selectedModelCost?.line || ''}
    onChange={(event) => {
      const selectedCost = modelCosts.find((cost) => cost.line === event.target.value);
      if (selectedCost) onModelCostChange(selectedCost);
    }}
    options={modelCosts.map((cost) => ({ value: cost.line, label: formatModelCostLabel(cost) }))}
    placeholder="Select unit size"
    data-testid="model-cost-select"
  />
);

export default ModelCostSelection;
