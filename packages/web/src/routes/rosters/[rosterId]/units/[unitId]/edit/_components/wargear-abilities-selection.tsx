import React from 'react';
import classNames from 'classnames';
import { slugify } from '@depot/core/utils/slug';
import type { depot } from '@depot/core';

import { formatAbilityName } from '@/utils/abilities';

interface WargearAbilitiesSelectionProps {
  abilities: depot.Ability[];
  selected: depot.Ability[];
  onChange: (abilities: depot.Ability[]) => void;
}

interface AbilityEntry {
  ability: depot.Ability;
  key: string;
  testId: string;
}

const WargearAbilitiesSelection: React.FC<WargearAbilitiesSelectionProps> = ({
  abilities,
  selected,
  onChange
}) => {
  const abilityEntries = React.useMemo<AbilityEntry[]>(() => {
    return abilities.map((ability, index) => {
      const friendlyName =
        formatAbilityName(ability) ||
        ability.name ||
        ability.parameter ||
        ability.description ||
        `wargear-ability-${index}`;
      const slugified = slugify(friendlyName);
      const key = ability.id ?? slugified ?? `wargear-ability-${index}`;
      const testId = slugified || `wargear-ability-${index}`;
      return {
        ability,
        key,
        testId
      };
    });
  }, [abilities]);

  const entryLookup = React.useMemo(
    () => new Map(abilityEntries.map((entry) => [entry.ability, entry])),
    [abilityEntries]
  );

  const normalizedSelected = React.useMemo(
    () => selected.filter((ability) => abilityEntries.some((entry) => entry.ability === ability)),
    [selected, abilityEntries]
  );

  const selectedSet = React.useMemo(() => new Set(normalizedSelected), [normalizedSelected]);

  const handleToggle = (entry: AbilityEntry) => {
    if (selectedSet.has(entry.ability)) {
      onChange(normalizedSelected.filter((item) => item !== entry.ability));
      return;
    }

    onChange([...normalizedSelected, entry.ability]);
  };

  if (abilities.length === 0) {
    return (
      <div className="rounded border border-subtle bg-muted p-3 text-sm text-subtle">
        No wargear-linked abilities available for this unit.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {abilityEntries.map((entry) => {
        const isSelected = selectedSet.has(entry.ability);
        return (
          <div
            key={entry.key}
            className="flex flex-wrap gap-2"
            data-testid={`wargear-ability-${entry.testId}`}
          >
            <button
              type="button"
              onClick={() => handleToggle(entry)}
              className={classNames(
                'inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface cursor-pointer',
                isSelected
                  ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm dark:border-primary-400 dark:bg-primary-900/40 dark:text-primary-50'
                  : 'border-subtle bg-surface text-foreground hover:border-primary-300 hover:bg-primary-50/50 dark:hover:border-primary-700 dark:hover:bg-primary-900/20'
              )}
              aria-pressed={isSelected}
              data-testid={`wargear-ability-pill-${entry.testId}`}
            >
              {formatAbilityName(entry.ability)}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default WargearAbilitiesSelection;
