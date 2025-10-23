import React from 'react';
import type { depot } from '@depot/core';
import { ToggleSwitch } from '@/components/ui';
import { useAppContext } from '@/contexts/app/use-app-context';

interface EnhancementSelectionProps {
  unit: depot.RosterUnit;
  roster: depot.Roster;
  selectedEnhancements: string[];
  onEnhancementChange: (enhancementIds: string[]) => void;
}

const EnhancementSelection: React.FC<EnhancementSelectionProps> = ({
  unit: _unit,
  roster,
  selectedEnhancements,
  onEnhancementChange
}) => {
  const { state: appState } = useAppContext();
  const availableEnhancements = roster.detachment?.enhancements || [];
  const showFluff = appState.settings?.showFluff ?? true;

  const isEnhancementSelected = (enhancementId: string): boolean => {
    return selectedEnhancements.includes(enhancementId);
  };

  const toggleEnhancement = (enhancementId: string): void => {
    if (isEnhancementSelected(enhancementId)) {
      // Remove enhancement
      onEnhancementChange(selectedEnhancements.filter((id) => id !== enhancementId));
    } else {
      // Add enhancement (typically only one enhancement per character)
      // For now, we'll allow multiple but could add business logic to limit to one
      onEnhancementChange([...selectedEnhancements, enhancementId]);
    }
  };

  if (availableEnhancements.length === 0) {
    return (
      <div className="text-center py-8" data-testid="no-enhancements-available">
        <p className="text-gray-500 dark:text-gray-400">
          No enhancements available for this detachment.
        </p>
      </div>
    );
  }

  const formatCost = (cost: string): string => {
    const numericCost = parseInt(cost, 10);
    if (isNaN(numericCost)) return cost;
    return `${numericCost} pts`;
  };

  return (
    <div className="flex flex-col gap-4" data-testid="enhancement-selection">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Select enhancements available to this character from your detachment.
      </div>

      <div className="flex flex-col gap-3">
        {availableEnhancements.map((enhancement) => (
          <div
            key={enhancement.id}
            className={`flex items-start justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/30 rounded hover:bg-gray-100/80 dark:hover:bg-gray-600/40 transition-colors ${
              isEnhancementSelected(enhancement.id)
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : ''
            }`}
            data-testid={`enhancement-option-${enhancement.id}`}
          >
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h5 className="font-medium text-gray-900 dark:text-white">{enhancement.name}</h5>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {formatCost(enhancement.cost)}
                </span>
              </div>

              {enhancement.legend && showFluff && (
                <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                  {enhancement.legend}
                </div>
              )}

              <div
                className="text-sm font-medium text-gray-900 dark:text-white"
                dangerouslySetInnerHTML={{ __html: enhancement.description }}
              />

              {enhancement.detachment && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Detachment: {enhancement.detachment}
                </div>
              )}
            </div>

            <div className="flex-shrink-0 ml-4">
              <ToggleSwitch
                label=""
                enabled={isEnhancementSelected(enhancement.id)}
                onChange={() => toggleEnhancement(enhancement.id)}
                size="sm"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Show selected enhancements summary */}
      {selectedEnhancements.length > 0 && (
        <div className="flex flex-col gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h5 className="font-medium text-green-900 dark:text-green-200">
            Selected Enhancements ({selectedEnhancements.length})
          </h5>
          <div className="flex flex-col gap-1">
            {selectedEnhancements.map((enhancementId) => {
              const enhancement = availableEnhancements.find((e) => e.id === enhancementId);
              if (!enhancement) return null;

              return (
                <div
                  key={enhancementId}
                  className="flex items-center justify-between text-sm text-green-800 dark:text-green-300"
                  data-testid={`selected-enhancement-${enhancementId}`}
                >
                  <span>{enhancement.name}</span>
                  <span className="font-medium">{formatCost(enhancement.cost)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancementSelection;
