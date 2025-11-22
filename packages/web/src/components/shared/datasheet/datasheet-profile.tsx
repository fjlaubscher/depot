import React, { useMemo } from 'react';
import type { depot } from '@depot/core';
import type { DatasheetListItem } from '@/types/datasheets';

// components
import DatasheetHero from './datasheet-hero';
import DatasheetWargear from './datasheet-wargear';
import DatasheetLeaderRules from './datasheet-leader-rules';
import { ModelStatsRow } from '@/components/shared';
import { DatasheetAbilities } from '@/components/shared/datasheet';

// utils
import { categorizeAbilities } from '@/utils/abilities';

interface DatasheetProfileProps {
  datasheet: depot.Datasheet;
  factionDatasheets?: DatasheetListItem[];
  abilitiesTestId?: string;
  compact?: boolean;
  showLeaderRules?: boolean;
  showWargear?: boolean;
  additionalAbilities?: depot.Ability[];
  excludeAbilityTypes?: string[];
}

const DatasheetProfile: React.FC<DatasheetProfileProps> = ({
  datasheet,
  factionDatasheets = [],
  abilitiesTestId = 'datasheet-abilities',
  compact = false,
  showLeaderRules = true,
  showWargear = true,
  additionalAbilities = [],
  excludeAbilityTypes = []
}) => {
  const abilitiesForDisplay = useMemo(() => {
    const excluded = new Set(excludeAbilityTypes.map((type) => type.toLowerCase()));
    const baseAbilities = excluded.size
      ? datasheet.abilities.filter(
          (ability) => !excluded.has(ability.type?.toLowerCase() ?? '')
        )
      : datasheet.abilities;

    return [...baseAbilities, ...additionalAbilities];
  }, [datasheet.abilities, additionalAbilities, excludeAbilityTypes]);

  const { inline: inlineAbilities, referenced: coreAbilities } = useMemo(() => {
    return categorizeAbilities(abilitiesForDisplay);
  }, [abilitiesForDisplay]);

  const mergedAbilities = useMemo(
    () => [...coreAbilities, ...inlineAbilities],
    [coreAbilities, inlineAbilities]
  );

  return (
    <div
      className={`flex flex-col ${compact ? 'gap-2' : 'gap-2 sm:gap-4'}`}
      data-testid="datasheet-profile"
    >
      {/* Model Stats Rows */}
      {datasheet.models.map((model) => (
        <ModelStatsRow key={model.line} model={model} variant={compact ? 'compact' : 'default'} />
      ))}
      <DatasheetHero datasheet={datasheet} factionDatasheets={factionDatasheets} />
      <DatasheetAbilities
        title="Abilities"
        abilities={mergedAbilities}
        dataTestId={abilitiesTestId}
      />
      {showLeaderRules ? (
        <DatasheetLeaderRules datasheet={datasheet} factionDatasheets={factionDatasheets} />
      ) : null}
      {showWargear ? <DatasheetWargear datasheet={datasheet} /> : null}
    </div>
  );
};

export default DatasheetProfile;
