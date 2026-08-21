import { useMemo } from 'react';
import type { FC } from 'react';
import type { depot } from '@depot/core';

// components
import { Tag, TagSection, TagGroup } from '@/components/ui';
import { DatasheetComposition } from '@/components/shared';
import PointsCosts from '@/components/shared/points-costs';

// utils
import { groupKeywords } from '@depot/core/utils/common';

interface DatasheetHeroProps {
  datasheet: depot.Datasheet;
  showPoints?: boolean;
}

const DatasheetHero: FC<DatasheetHeroProps> = ({ datasheet, showPoints = true }) => {
  const { keywords, unitComposition, loadout, transport } = datasheet;
  const keywordTags = useMemo(() => {
    const grouped = groupKeywords(keywords);
    return [...grouped.datasheet, ...grouped.faction];
  }, [keywords]);

  return (
    <div className="flex flex-col gap-2">
      <DatasheetComposition
        composition={unitComposition}
        loadout={loadout}
        transport={transport}
        data-testid="unit-composition"
      />

      {datasheet.isSupport ? (
        <TagGroup spacing="sm" data-testid="datasheet-support">
          <Tag variant="secondary" size="sm">
            Support
          </Tag>
        </TagGroup>
      ) : null}

      {showPoints ? (
        <PointsCosts
          costs={datasheet.modelCosts}
          fallbackName={datasheet.name}
          data-testid="datasheet-points"
        />
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
