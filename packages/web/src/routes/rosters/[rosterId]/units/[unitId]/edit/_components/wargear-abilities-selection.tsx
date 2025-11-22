import React from 'react';
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
  const handleToggle = (ability: depot.Ability) => {
    const isSelected = selected.some((item) => item.id === ability.id);
    if (isSelected) {
      onChange(selected.filter((item) => item.id !== ability.id));
    } else {
      onChange([...selected, ability]);
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
    <div className="flex flex-col gap-2">
      {abilities.map((ability) => {
        const isSelected = selected.some((item) => item.id === ability.id);
        return (
          <label
            key={ability.id}
            className="flex cursor-pointer gap-2 rounded border border-subtle bg-surface p-3 transition hover:border-primary-300 hover:bg-primary-50/50 dark:hover:border-primary-700 dark:hover:bg-primary-900/20"
            data-testid={`wargear-ability-${ability.id}`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggle(ability)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800"
              data-testid={`wargear-ability-checkbox-${ability.id}`}
            />
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{formatAbilityName(ability)}</span>
                <Tag variant="warning" size="sm" className="uppercase">
                  Wargear
                </Tag>
              </div>
              <p
                className="text-sm text-muted"
                dangerouslySetInnerHTML={{ __html: ability.description }}
              />
            </div>
          </label>
        );
      })}
    </div>
  );
};

export default WargearAbilitiesSelection;
