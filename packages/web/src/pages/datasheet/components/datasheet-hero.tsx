import type { FC } from 'react';
import type { depot } from '@depot/core';

// components
import { Tag, TagSection } from '@/components/ui';
import { ModelStatsRow, DatasheetComposition } from '@/components/shared';

// utils
import { groupKeywords } from '@/utils/keywords';

interface DatasheetHeroProps {
  datasheet: depot.Datasheet;
}

const DatasheetHero: FC<DatasheetHeroProps> = ({ datasheet }) => {
  const { models, keywords, unitComposition, loadout } = datasheet;
  const groupedKeywords = groupKeywords(keywords);

  if (models.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Model Stats Rows */}
      {models.map((model) => (
        <ModelStatsRow key={model.line} model={model} />
      ))}

      <DatasheetComposition
        composition={unitComposition}
        loadout={loadout}
        data-testid="unit-composition"
      />

      {/* Keywords */}
      <div className="flex flex-col gap-2">
        {groupedKeywords.datasheet.length > 0 ? (
          <TagSection title="Keywords" spacing="sm">
            {groupedKeywords.datasheet.map((keyword, i) => (
              <Tag key={`keyword-${i}`} variant="default" size="sm">
                {keyword}
              </Tag>
            ))}
          </TagSection>
        ) : null}
        {groupedKeywords.faction.length > 0 ? (
          <TagSection title="Faction Keywords" spacing="sm">
            {groupedKeywords.faction.map((keyword, i) => (
              <Tag key={`faction-keyword-${i}`} variant="primary" size="sm">
                {keyword}
              </Tag>
            ))}
          </TagSection>
        ) : null}
      </div>
    </div>
  );
};

export default DatasheetHero;
