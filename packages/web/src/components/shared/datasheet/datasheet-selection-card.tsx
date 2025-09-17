import React from 'react';
import { depot } from '@depot/core';
import { Plus } from 'lucide-react';
import { Button, ContentCard, PointsTag } from '@/components/ui';

interface DatasheetSelectionCardProps {
  datasheet: depot.Datasheet;
  onAdd: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
}

export const DatasheetSelectionCard: React.FC<DatasheetSelectionCardProps> = ({
  datasheet,
  onAdd
}) => {
  const defaultModelCost = datasheet.modelCosts[0];

  const handleAdd = () => {
    if (defaultModelCost) {
      onAdd(datasheet, defaultModelCost);
    }
  };

  return (
    <ContentCard title={datasheet.name} padding="sm">
      <div className="flex justify-between items-center">
        {defaultModelCost && <PointsTag points={defaultModelCost.cost} />}

        <Button size="sm" variant="secondary" onClick={handleAdd} disabled={!defaultModelCost}>
          <Plus size={16} className="mr-1" />
          Add
        </Button>
      </div>
    </ContentCard>
  );
};
