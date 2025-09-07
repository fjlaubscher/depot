import React from 'react';
import { depot } from '@depot/core';

// components
import { Tag, TagGroup } from '@/components/ui/tag';
import ModelStatsRow from './model-stats-row';

// utils
import { groupKeywords } from '@/utils/keywords';

interface DatasheetHeroProps {
  datasheet: depot.Datasheet;
  cost?: depot.ModelCost;
}

const DatasheetHero: React.FC<DatasheetHeroProps> = ({ datasheet, cost }) => {
  const { models, keywords } = datasheet;
  const groupedKeywords = groupKeywords(keywords);

  if (models.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Model Stats Rows */}
      <div className="flex flex-col gap-4 overflow-x-scroll">
        {models.map((model) => (
          <ModelStatsRow key={model.line} model={model} />
        ))}
      </div>

      {/* Keywords */}
      <div className="flex flex-col gap-2">
        {groupedKeywords.datasheet.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
              Keywords
            </span>
            <TagGroup spacing="sm">
              {groupedKeywords.datasheet.map((keyword, i) => (
                <Tag key={`keyword-${i}`} variant="default" size="sm">
                  {keyword}
                </Tag>
              ))}
            </TagGroup>
          </div>
        )}
        {groupedKeywords.faction.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
              Faction Keywords
            </span>
            <TagGroup spacing="sm">
              {groupedKeywords.faction.map((keyword, i) => (
                <Tag key={`faction-keyword-${i}`} variant="primary" size="sm">
                  {keyword}
                </Tag>
              ))}
            </TagGroup>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasheetHero;
