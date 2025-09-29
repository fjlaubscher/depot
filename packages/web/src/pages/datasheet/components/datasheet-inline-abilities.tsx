import React from 'react';
import type { depot } from '@depot/core';
import { getAbilityTypeBadge } from '../utils/abilities';

interface DatasheetInlineAbilitiesProps {
  abilities: depot.Ability[];
}

const DatasheetInlineAbilities: React.FC<DatasheetInlineAbilitiesProps> = ({ abilities }) => {
  if (abilities.length === 0) return null;

  return (
    <div data-testid="inline-abilities">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Unit Abilities</h4>
      <div className="space-y-3">
        {abilities.map((ability, index) => {
          const badge = getAbilityTypeBadge(ability.type);

          return (
            <div
              key={ability.id || `ability-${index}`}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h5 className="font-semibold text-gray-900 dark:text-white">{ability.name}</h5>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color} shrink-0`}
                >
                  {badge.text}
                </span>
              </div>
              <div
                className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: ability.description }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DatasheetInlineAbilities;
