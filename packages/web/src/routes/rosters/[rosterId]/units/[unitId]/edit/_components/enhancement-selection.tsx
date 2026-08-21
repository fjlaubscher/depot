import React from 'react';
import classNames from 'classnames';
import type { depot } from '@depot/core';
import { ToggleSwitch } from '@/components/ui';
import EnhancementCard from '@/components/shared/enhancement-card';

interface EnhancementSelectionProps {
  enhancements: depot.Enhancement[];
  selectedEnhancements: string[];
  onEnhancementChange: (enhancementIds: string[]) => void;
}

const EnhancementSelection: React.FC<EnhancementSelectionProps> = ({
  enhancements,
  selectedEnhancements,
  onEnhancementChange
}) => {
  if (enhancements.length === 0) {
    return (
      <div className="text-center py-8" data-testid="no-enhancements-available">
        <p className="text-subtle">No enhancements available for this unit.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid="enhancement-selection">
      <div className="text-sm text-muted">Select one enhancement from your detachments.</div>

      <div className="flex flex-col gap-3">
        {enhancements.map((enhancement) => {
          const selected = selectedEnhancements.includes(enhancement.id);
          return (
            <div
              key={enhancement.id}
              className="flex items-start gap-4"
              data-testid={`enhancement-option-${enhancement.id}`}
            >
              <div
                className={classNames(
                  'flex min-w-0 flex-1 flex-col gap-1 rounded-lg',
                  selected && 'ring-2 ring-primary-500'
                )}
              >
                <EnhancementCard enhancement={enhancement} />
                {enhancement.detachment ? (
                  <span className="text-xs text-subtle">Detachment: {enhancement.detachment}</span>
                ) : null}
              </div>
              <ToggleSwitch
                label=""
                ariaLabel={`Select ${enhancement.name}`}
                enabled={selected}
                // Core rules 25.04: no unit can have more than one enhancement, so selecting replaces.
                onChange={() => onEnhancementChange(selected ? [] : [enhancement.id])}
                size="sm"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancementSelection;
