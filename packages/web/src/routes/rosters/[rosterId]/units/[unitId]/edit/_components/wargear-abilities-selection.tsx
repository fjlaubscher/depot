import React from 'react';
import classNames from 'classnames';
import type { depot } from '@depot/core';

import { Tag } from '@/components/ui';
import { formatAbilityName } from '@/utils/abilities';

interface WargearAbilitiesSelectionProps {
  abilities: depot.Ability[];
  selected: depot.Ability[];
  onChange: (abilities: depot.Ability[]) => void;
}

const WargearAbilitiesSelection: React.FC<WargearAbilitiesSelectionProps> = ({
  abilities,
  selected,
  onChange
}) => {
  const selectedMap = React.useMemo(
    () => new Map(abilities.map((ability) => [ability.id, ability])),
    [abilities]
  );

  const normalizedSelected = React.useMemo(
    () => selected.filter((ability) => selectedMap.has(ability.id)),
    [selected, selectedMap]
  );

  const selectedIds = React.useMemo(
    () => new Set(normalizedSelected.map((ability) => ability.id)),
    [normalizedSelected]
  );

  const handleToggle = (ability: depot.Ability) => {
    const isSelected = selectedIds.has(ability.id);
    if (isSelected) {
      onChange(normalizedSelected.filter((item) => item.id !== ability.id));
    } else {
      const normalizedAbility = selectedMap.get(ability.id) ?? ability;
      onChange([...normalizedSelected, normalizedAbility]);
    }
  };

  if (abilities.length === 0) {
    return (
      <div className="rounded border border-subtle bg-muted p-3 text-sm text-subtle">
        No wargear-linked abilities available for this unit.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {normalizedSelected.length > 0 ? (
        <div
          className="flex flex-wrap gap-2"
          aria-label="Selected wargear abilities"
          data-testid="selected-wargear-ability-tags"
        >
          {normalizedSelected.map((ability) => (
            <Tag key={ability.id} variant="warning" size="sm">
              {formatAbilityName(ability)}
            </Tag>
          ))}
        </div>
      ) : null}

      {abilities.map((ability) => {
        const isSelected = selectedIds.has(ability.id);
        return (
          <div
            key={ability.id}
            className="flex flex-col gap-2"
            data-testid={`wargear-ability-${ability.id}`}
          >
            <button
              type="button"
              onClick={() => handleToggle(ability)}
              className={classNames(
                'inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface',
                isSelected
                  ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm dark:border-primary-400 dark:bg-primary-900/40 dark:text-primary-50'
                  : 'border-subtle bg-surface text-foreground hover:border-primary-300 hover:bg-primary-50/50 dark:hover:border-primary-700 dark:hover:bg-primary-900/20'
              )}
              aria-pressed={isSelected}
              data-testid={`wargear-ability-pill-${ability.id}`}
            >
              <span>{formatAbilityName(ability)}</span>
              <Tag variant="warning" size="sm" className="uppercase">
                Wargear
              </Tag>
            </button>
            <p
              className="text-sm text-muted"
              dangerouslySetInnerHTML={{ __html: ability.description }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default WargearAbilitiesSelection;
