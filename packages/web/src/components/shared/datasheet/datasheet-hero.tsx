import { useMemo } from 'react';
import type { FC } from 'react';
import type { depot } from '@depot/core';

// components
import { Tag, TagSection, TagGroup } from '@/components/ui';
import { DatasheetComposition } from '@/components/shared';

// utils
import { groupKeywords } from '@/utils/keywords';

interface DatasheetHeroProps {
  datasheet: depot.Datasheet;
  showPoints?: boolean;
  compositionVariant?: 'default' | 'compact';
}

const DatasheetHero: FC<DatasheetHeroProps> = ({
  datasheet,
  showPoints = true,
  compositionVariant = 'default'
}) => {
  const { keywords, unitComposition, loadout, transport } = datasheet;
  const groupedKeywords = useMemo(() => groupKeywords(keywords), [keywords]);
  const keywordTags = useMemo(
    () => [...groupedKeywords.datasheet, ...groupedKeywords.faction],
    [groupedKeywords]
  );

  const pointTags = datasheet.modelCosts.map((cost) => ({
    key: `${cost.datasheetId}-${cost.line}`,
    label: cost.description ? `${cost.cost} pts (${cost.description})` : `${cost.cost} pts`
  }));

  return (
    <div className="flex flex-col gap-2">
      <DatasheetComposition
        composition={unitComposition}
        loadout={loadout}
        transport={transport}
        variant={compositionVariant}
        data-testid="unit-composition"
      />

      {showPoints && pointTags.length > 0 ? (
        <TagGroup spacing="sm" className="flex-wrap" data-testid="datasheet-points">
          {pointTags.map((entry) => (
            <Tag key={entry.key} variant="primary" size="sm">
              {entry.label}
            </Tag>
          ))}
        </TagGroup>
      ) : null}

      {/* Keywords */}
      {keywordTags.length > 0 ? (
        <TagSection title="Keywords" spacing="sm">
          {keywordTags.map((keyword, i) => (
            <Tag key={`keyword-${i}`} variant="default" size="sm">
              {keyword}
            </Tag>
          ))}
        </TagSection>
      ) : null}
    </div>
  );
};

export default DatasheetHero;
