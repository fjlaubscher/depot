import type { FC } from 'react';
import { useMemo, useState } from 'react';
import type { depot } from '@depot/core';

import { ContentCard, PointsTag, Tag, SelectField, Button } from '@/components/ui';

interface DatasheetSelectionCardProps {
  datasheet: depot.Datasheet;
  onAdd: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => void;
  getUnitCount: (datasheet: depot.Datasheet, modelCost: depot.ModelCost) => number;
}

export const DatasheetSelectionCard: FC<DatasheetSelectionCardProps> = ({
  datasheet,
  onAdd,
  getUnitCount
}) => {
  const [selectedCostLine, setSelectedCostLine] = useState<string | null>(
    datasheet.modelCosts[0]?.line ?? null
  );

  const modelCostOptions = useMemo(() => {
    return datasheet.modelCosts.map((cost) => ({
      label: cost.description || datasheet.name,
      value: cost.line
    }));
  }, [datasheet.modelCosts, datasheet.name]);

  const selectedModelCost = useMemo(() => {
    if (!datasheet.modelCosts.length) {
      return null;
    }

    const matched = datasheet.modelCosts.find((cost) => cost.line === selectedCostLine);
    return matched ?? datasheet.modelCosts[0];
  }, [datasheet.modelCosts, selectedCostLine]);

  const count = useMemo(() => {
    if (!selectedModelCost) {
      return 0;
    }

    return getUnitCount(datasheet, selectedModelCost);
  }, [datasheet, selectedModelCost, getUnitCount]);

  const handleAdd = () => {
    if (selectedModelCost) {
      onAdd(datasheet, selectedModelCost);
    }
  };

  return (
    <ContentCard
      title={datasheet.name}
      actions={selectedModelCost ? <PointsTag points={selectedModelCost.cost} /> : undefined}
      padding="sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-2">
          {datasheet.modelCosts.length > 1 ? (
            <SelectField
              fullWidth={false}
              options={modelCostOptions}
              value={selectedModelCost?.line ?? ''}
              onChange={(event) => setSelectedCostLine(event.target.value)}
              aria-label={`Select ${datasheet.name} loadout`}
            />
          ) : null}

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

        <div className="flex items-center gap-1">
          <Button size="sm" variant="accent" onClick={handleAdd} disabled={!selectedModelCost}>
            Add
          </Button>
        </div>
      </div>
    </ContentCard>
  );
};
