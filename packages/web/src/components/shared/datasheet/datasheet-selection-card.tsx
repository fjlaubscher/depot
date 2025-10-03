import React from 'react';
import type { depot } from '@depot/core';
import { Plus } from 'lucide-react';
import { Button, ContentCard, PointsTag, Tag } from '@/components/ui';

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
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          {defaultModelCost && <PointsTag points={defaultModelCost.cost} className="self-start" />}

          {(datasheet.isLegends || datasheet.isForgeWorld) && (
            <div className="flex flex-wrap gap-2 w-fit self-start">
              {datasheet.isLegends ? (
                <Tag size="sm" variant="warning">
                  Warhammer Legends
                </Tag>
              ) : null}
              {datasheet.isForgeWorld ? (
                <Tag size="sm" variant="secondary">
                  Forge World
                </Tag>
              ) : null}
            </div>
          )}
        </div>

        <Button size="sm" variant="secondary" onClick={handleAdd} disabled={!defaultModelCost}>
          <Plus size={16} className="mr-1" />
          Add
        </Button>
      </div>
    </ContentCard>
  );
};
