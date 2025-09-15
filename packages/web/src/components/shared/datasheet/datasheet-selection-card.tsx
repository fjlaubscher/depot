import React from 'react';
import { depot } from '@depot/core';
import { Plus } from 'lucide-react';
import { Button, Card, PointsTag } from '@/components/ui';

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
    <Card padding="sm">
      <div className="flex flex-col gap-3">
        <h4 className="font-medium text-gray-900 dark:text-white truncate">{datasheet.name}</h4>

        <div className="flex justify-between items-center">
          {defaultModelCost && <PointsTag points={defaultModelCost.cost} />}

          <Button size="sm" onClick={handleAdd} disabled={!defaultModelCost}>
            <Plus size={16} className="mr-1" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
};
