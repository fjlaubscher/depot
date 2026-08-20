import React from 'react';
import type { depot } from '@depot/core';
import { ToggleSwitch } from '@/components/ui';
import { useSettingsContext } from '@/contexts/settings/use-settings-context';

interface EnhancementSelectionProps {
  enhancements: depot.Enhancement[];
  selectedEnhancements: string[];
  onEnhancementChange: (enhancementIds: string[]) => void;
}

const EnhancementSelection: React.FC<EnhancementSelectionProps> = ({
  enhancements: availableEnhancements,
  selectedEnhancements,
  onEnhancementChange
}) => {
  const { settings } = useSettingsContext();
  const showFluff = settings.showFluff ?? true;

  const isEnhancementSelected = (enhancementId: string): boolean => {
    return selectedEnhancements.includes(enhancementId);
  };

  // Core rules 25.04: no unit can have more than one enhancement, so selecting replaces.
  const toggleEnhancement = (enhancementId: string): void => {
    onEnhancementChange(isEnhancementSelected(enhancementId) ? [] : [enhancementId]);
  };

  if (availableEnhancements.length === 0) {
    return (
      <div className="text-center py-8" data-testid="no-enhancements-available">
        <p className="text-subtle">No enhancements available for this unit.</p>
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
      <div className="text-sm text-muted">Select one enhancement from your detachments.</div>

      <div className="flex flex-col gap-3">
        {availableEnhancements.map((enhancement) => (
          <div
            key={enhancement.id}
            className={`flex items-start justify-between p-3 bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/30 rounded hover:bg-gray-100/80 dark:hover:bg-gray-600/40 transition-colors ${
              isEnhancementSelected(enhancement.id) ? 'ring-2 ring-blue-500 surface-info' : ''
            }`}
            data-testid={`enhancement-option-${enhancement.id}`}
          >
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h5 className="font-medium text-foreground">{enhancement.name}</h5>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-muted">
                  {formatCost(enhancement.cost)}
                </span>
                {enhancement.upgrade ? (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium surface-info text-info-strong">
                    Upgrade
                  </span>
                ) : null}
              </div>

              {enhancement.legend && showFluff && (
                <div className="text-sm text-muted italic">{enhancement.legend}</div>
              )}

              <div
                className="text-sm font-medium text-foreground"
                dangerouslySetInnerHTML={{ __html: enhancement.description }}
              />

              {enhancement.detachment && (
                <div className="text-xs text-subtle">Detachment: {enhancement.detachment}</div>
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
        <div className="flex flex-col gap-2 p-3 surface-success border border-success rounded-lg">
          <h5 className="font-medium text-success-strong">
            Selected Enhancements ({selectedEnhancements.length})
          </h5>
          <div className="flex flex-col gap-1">
            {selectedEnhancements.map((enhancementId) => {
              const enhancement = availableEnhancements.find((e) => e.id === enhancementId);
              if (!enhancement) return null;

              return (
                <div
                  key={enhancementId}
                  className="flex items-center justify-between text-sm text-success"
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
