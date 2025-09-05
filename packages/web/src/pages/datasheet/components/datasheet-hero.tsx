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
  const { role, models, keywords } = datasheet;
  const groupedKeywords = groupKeywords(keywords);

  if (models.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Model Stats Rows */}
      <div className="flex flex-col gap-4">
        {models.map((model) => (
          <ModelStatsRow key={model.line} model={model} />
        ))}
      </div>

      {/* Secondary Info */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
        {/* Role + Cost */}
        <div className="flex flex-col gap-2">
          <Tag variant="secondary" size="lg">
            {role}
          </Tag>
          {cost && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Points Cost
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                  {cost.cost}
                </span>
              </div>
            </div>
          )}
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
    </div>
  );
};

export default DatasheetHero;
