import { useMemo } from 'react';
import type { FC } from 'react';
import type { depot } from '@depot/core';
import type { DatasheetListItem } from '@/types/datasheets';

// components
import { Tag, TagSection, TagGroup } from '@/components/ui';
import { DatasheetComposition } from '@/components/shared';
import DatasheetLeaderRules from './datasheet-leader-rules';

// utils
import { groupKeywords } from '@/utils/keywords';

interface DatasheetHeroProps {
  datasheet: depot.Datasheet;
  factionDatasheets: DatasheetListItem[];
}

const DatasheetHero: FC<DatasheetHeroProps> = ({ datasheet, factionDatasheets }) => {
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
    <div className="flex flex-col gap-2 sm:gap-4">
      <DatasheetComposition
        composition={unitComposition}
        loadout={loadout}
        transport={transport}
        data-testid="unit-composition"
      />

      <DatasheetLeaderRules datasheet={datasheet} factionDatasheets={factionDatasheets} />

      {pointTags.length > 0 ? (
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
