import React from 'react';
import { cx } from '@/utils/cx';
import type { depot } from '@depot/core';

interface EnhancementSelectionProps {
  enhancements: depot.Enhancement[];
  selectedEnhancements: string[];
  onEnhancementChange: (enhancementIds: string[]) => void;
}

const Radio: React.FC<{ checked: boolean }> = ({ checked }) => (
  <span
    aria-hidden
    className={cx(
      'mt-0.5 size-4 flex-none rounded-full',
      checked
        ? 'border-[5px] border-accent-600 dark:border-accent-500'
        : 'border-[1.5px] border-border-strong'
    )}
  />
);

const rowClasses = (selected: boolean) =>
  cx(
    'flex w-full cursor-pointer items-start gap-2.5 rounded-sm border px-3 py-2.5 text-left transition-colors focus-ring-primary',
    selected
      ? 'border-border-accent bg-surface-accent'
      : 'border-border-subtle bg-surface-card hover:border-border-accent'
  );

/**
 * Core rules 25.04: a unit may hold at most one enhancement, so this is a
 * radio group with an explicit "none" rather than a row of toggles — the
 * indicator costs almost nothing on a full-width row.
 */
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

  const [selectedId] = selectedEnhancements;

  return (
    <div
      role="radiogroup"
      aria-label="Enhancement"
      className="flex flex-col gap-1"
      data-testid="enhancement-selection"
    >
      <button
        type="button"
        role="radio"
        aria-checked={!selectedId}
        onClick={() => onEnhancementChange([])}
        className={cx(rowClasses(!selectedId), 'items-center')}
        data-testid="enhancement-option-none"
      >
        <Radio checked={!selectedId} />
        <span className="text-[13px] font-bold text-foreground">No enhancement</span>
      </button>

      {enhancements.map((enhancement) => {
        const selected = enhancement.id === selectedId;

        return (
          <button
            key={enhancement.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onEnhancementChange(selected ? [] : [enhancement.id])}
            className={rowClasses(selected)}
            data-testid={`enhancement-option-${enhancement.id}`}
          >
            <Radio checked={selected} />

            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-baseline gap-2">
                <span className="min-w-0 flex-1 text-[13px] leading-tight font-bold text-foreground">
                  {enhancement.name}
                </span>
                {enhancement.cost ? (
                  <span className="flex-none font-mono text-[11px] font-bold text-accent">
                    +{enhancement.cost}
                  </span>
                ) : null}
              </span>

              {enhancement.detachment ? (
                <span className="font-mono text-[9.5px] font-medium uppercase text-subtle">
                  {enhancement.detachment}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default EnhancementSelection;
