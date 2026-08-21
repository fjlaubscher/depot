import type { FC } from 'react';
import { useState } from 'react';
import type { depot } from '@depot/core';

import { Card, Tag, SelectField, Button } from '@/components/ui';
import { groupKeywords } from '@depot/core/utils/common';
import { formatModelCostLabel, modelCostsForOrdinal } from '@depot/core/utils/model-costs';
import { getSupplementStyles } from '@/utils/supplement-styles';

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
  const availableModelCosts = modelCostsForOrdinal(datasheet.modelCosts);

  const [selectedCostLine, setSelectedCostLine] = useState<string | null>(
    availableModelCosts[0]?.line ?? null
  );

  const modelCostOptions = availableModelCosts.map((cost) => ({
    label: formatModelCostLabel(cost, datasheet.name),
    value: cost.line
  }));

  const selectedModelCost =
    availableModelCosts.find((cost) => cost.line === selectedCostLine) ??
    availableModelCosts[0] ??
    null;

  const factionKeywords = groupKeywords(datasheet.keywords).faction;
  const supplementStyles = getSupplementStyles(datasheet.supplementKey);

  const normalize = (value: string) => value.toLowerCase().replace(/[\s-]+/g, '');
  const supplementNames = new Set(
    [
      datasheet.supplementLabel,
      datasheet.supplementName,
      datasheet.supplementSlug,
      datasheet.supplementKey
    ]
      .filter((value): value is string => Boolean(value))
      .map(normalize)
  );
  const isSupplementKeyword = (keyword: string) => supplementNames.has(normalize(keyword));

  const handleAdd = () => {
    if (selectedModelCost) {
      onAdd(datasheet, selectedModelCost);
    }
  };

  return (
    <Card
      className="flex h-full flex-col"
      padding="sm"
      data-testid={`datasheet-card-${datasheet.slug}`}
    >
      <div className="flex flex-1 flex-col gap-2">
        <Card.Header className="gap-4">
          <div className="min-w-0 flex-1">
            <Card.Title className="truncate text-base">{datasheet.name}</Card.Title>
          </div>
          {selectedModelCost ? (
            <div className="flex items-start gap-3">
              <Tag variant="primary" size="sm" className="rounded-md py-1">
                {selectedModelCost.cost} pts
              </Tag>
            </div>
          ) : null}
        </Card.Header>

        <Card.Content className="flex flex-1 h-full flex-col gap-2 text-sm md:text-base">
          <div className="flex min-w-0 flex-col gap-1">
            {(datasheet.isLegends || datasheet.isForgeWorld || datasheet.isSupport) && (
              <div className="flex w-fit flex-wrap gap-2 self-start">
                {datasheet.isSupport ? (
                  <Tag size="sm" variant="secondary">
                    Support
                  </Tag>
                ) : null}
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

            {factionKeywords.length > 1 ? (
              <div className="flex flex-wrap gap-2" data-testid="faction-keywords">
                {factionKeywords.map((keyword) => (
                  <Tag
                    key={keyword}
                    size="sm"
                    variant="default"
                    className={isSupplementKeyword(keyword) ? supplementStyles.tagClass : undefined}
                  >
                    {keyword}
                  </Tag>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2">
            {availableModelCosts.length > 1 ? (
              <SelectField
                fullWidth={false}
                className="max-w-[14rem] md:max-w-[18rem]"
                options={modelCostOptions}
                value={selectedModelCost?.line ?? ''}
                onChange={(event) => setSelectedCostLine(event.target.value)}
                aria-label={`Select ${datasheet.name} loadout`}
              />
            ) : null}

            <div className="ml-auto">
              <Button
                size="sm"
                variant="accent"
                onClick={handleAdd}
                disabled={!selectedModelCost}
                data-testid={`add-datasheet-${datasheet.slug}`}
              >
                Add
              </Button>
            </div>
          </div>
        </Card.Content>
      </div>
    </Card>
  );
};
