import type { FC } from 'react';
import { useMemo, useState } from 'react';
import type { depot } from '@depot/core';

import { ContentCard, PointsTag, Tag, SelectField, Button } from '@/components/ui';
import { groupKeywords } from '@/utils/keywords';
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

  const factionKeywords = useMemo(() => {
    return groupKeywords(datasheet.keywords).faction;
  }, [datasheet.keywords]);

  const supplementStyles = useMemo(
    () => getSupplementStyles(datasheet.supplementKey),
    [datasheet.supplementKey]
  );

  const isSupplementKeyword = (keyword: string): boolean => {
    if (!datasheet.supplementKey && !datasheet.supplementLabel && !datasheet.supplementName) {
      return false;
    }

    const normalize = (value: string) => value.toLowerCase().replace(/[\s-]+/g, '');
    const keywordNorm = normalize(keyword);
    const candidates = [
      datasheet.supplementLabel,
      datasheet.supplementName,
      datasheet.supplementSlug,
      datasheet.supplementKey
    ]
      .filter(Boolean)
      .map(normalize);

    return candidates.some((candidate) => candidate === keywordNorm);
  };

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
      contentGap="sm"
      titleClassName="text-base"
      data-testid={`datasheet-card-${datasheet.slug}`}
    >
      <div className="flex h-full flex-col gap-2 text-sm md:text-base">
        <div className="flex min-w-0 flex-col gap-1">
          {(datasheet.isLegends || datasheet.isForgeWorld) && (
            <div className="flex w-fit flex-wrap gap-2 self-start">
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
          {datasheet.modelCosts.length > 1 ? (
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
      </div>
    </ContentCard>
  );
};
