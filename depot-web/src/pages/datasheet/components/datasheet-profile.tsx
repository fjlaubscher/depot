import React, { useMemo } from 'react';
import { depot } from 'depot-core';

// components
import Card from '@/components/ui/card';
import Grid from '@/components/ui/grid';
import { Tag, TagGroup } from '@/components/ui/tag';
import ModelProfileTable from './model-profile-table';
import WargearTable from './wargear-table';

// utils
import { sortByName } from '@/utils/array';
import { groupKeywords } from '@/utils/keywords';

interface DatasheetProfileProps {
  datasheet: depot.Datasheet;
}

const DatasheetProfile: React.FC<DatasheetProfileProps> = ({ datasheet }) => {
  const {
    abilities,
    unitComposition,
    keywords,
    models,
    options: datasheetOptions,
    wargear
  } = datasheet;

  const sortedAbilities = useMemo(() => sortByName(abilities) as depot.Ability[], [abilities]);
  const groupedKeywords = useMemo(() => groupKeywords(keywords), [keywords]);
  const options = useMemo(() => datasheetOptions.filter((o) => o.description), [datasheetOptions]);

  const [meleeWargear, rangedWargear] = useMemo(() => {
    const melee = wargear.filter((w) => w.type === 'Melee');
    const ranged = wargear.filter((w) => w.type === 'Ranged');
    return [melee, ranged];
  }, [wargear]);

  return (
    <div className="space-y-6" data-testid="datasheet-profile">
      {/* Model Profiles */}
      <ModelProfileTable models={models} />

      {/* Wargear Tables */}
      <WargearTable wargear={rangedWargear} type="Ranged" />
      <WargearTable wargear={meleeWargear} type="Melee" />

      {/* Unit Composition */}
      {unitComposition.length > 0 && (
        <div data-testid="unit-composition">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Unit Composition
          </h4>
          <Card className="p-4">
            <ul className="space-y-2">
              {unitComposition.map((comp, i) => (
                <li
                  key={`composition-${comp.line}`}
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  {comp.description} {models[i] ? `(${models[i].baseSize})` : null}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Unit Options */}
      {options.length > 0 && (
        <div data-testid="unit-options">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Unit Options</h4>
          <Card className="p-4">
            <ul className="space-y-2">
              {options.map((option) => (
                <li
                  key={`unit-option-${option.line}`}
                  className="text-sm text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: option.description }}
                />
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Abilities */}
      {sortedAbilities.length > 0 && (
        <div data-testid="abilities">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Abilities</h4>
          <Grid>
            {sortedAbilities.map((ability) => (
              <Card key={ability.id} className="p-4 h-full">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{ability.name}</h5>
                <div
                  className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: ability.description }}
                />
              </Card>
            ))}
          </Grid>
        </div>
      )}

      {/* Keywords */}
      {groupedKeywords.datasheet.length > 0 && (
        <div data-testid="keywords">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Keywords</h4>
          <TagGroup>
            {groupedKeywords.datasheet.map((keyword, i) => (
              <Tag key={`keyword-${i}`} variant="default" size="sm">
                {keyword}
              </Tag>
            ))}
          </TagGroup>
        </div>
      )}

      {/* Faction Keywords */}
      {groupedKeywords.faction.length > 0 && (
        <div data-testid="faction-keywords">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Faction Keywords
          </h4>
          <TagGroup>
            {groupedKeywords.faction.map((keyword, i) => (
              <Tag key={`faction-keyword-${i}`} variant="primary" size="sm">
                {keyword}
              </Tag>
            ))}
          </TagGroup>
        </div>
      )}
    </div>
  );
};

export default DatasheetProfile;
