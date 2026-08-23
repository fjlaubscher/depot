import React from 'react';
import { cx } from '@/utils/cx';
import { slugify } from '@depot/core/utils/slug';
import type { depot } from '@depot/core';

import { formatAbilityName } from '@depot/core/utils/abilities';

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

const getAbilityKey = (ability: depot.Ability, index: number) => {
  const friendlyName =
    formatAbilityName(ability) || ability.name || ability.parameter || `wargear-ability-${index}`;
  return slugify(friendlyName);
};

const WargearAbilitiesSelection: React.FC<WargearAbilitiesSelectionProps> = ({
  abilities,
  selected,
  onChange
}) => {
  const abilityEntries = React.useMemo<AbilityEntry[]>(() => {
    return abilities
      .map((ability, index) => {
        const slugified = getAbilityKey(ability, index);
        if (!slugified) return null;
        return {
          ability,
          key: slugified,
          testId: slugified
        };
      })
      .filter((entry): entry is AbilityEntry => entry !== null);
  }, [abilities]);

  const selectedKeys = React.useMemo(
    () =>
      new Set(
        selected
          .map((ability, index) => {
            return getAbilityKey(ability, index);
          })
          .filter(Boolean) as string[]
      ),
    [selected]
  );

  const handleToggle = (entry: AbilityEntry) => {
    if (selectedKeys.has(entry.key)) {
      onChange(
        selected.filter((ability, index) => {
          return getAbilityKey(ability, index) !== entry.key;
        })
      );
      return;
    }

    const abilityWithId = entry.ability.id ? entry.ability : { ...entry.ability, id: entry.key };
    onChange([...selected, abilityWithId]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {abilityEntries.map((entry) => {
        const isSelected = selectedKeys.has(entry.key);
        return (
          <div
            key={entry.key}
            className="flex flex-wrap gap-2"
            data-testid={`wargear-ability-${entry.testId}`}
          >
            <button
              type="button"
              onClick={() => handleToggle(entry)}
              className={cx(
                'inline-flex w-fit items-center gap-2 rounded-sm border px-3 min-h-11 text-sm font-bold transition focus-ring-primary cursor-pointer',
                isSelected
                  ? 'border-border-accent bg-surface-accent text-accent shadow-e1'
                  : 'border-border-subtle bg-surface-card text-foreground hover:border-border-accent hover:bg-surface-accent'
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
