import type { FC } from 'react';
import type { depot } from '@depot/core';
import { sortByName } from '@depot/core/utils/common';
import { getBattleSize } from '@depot/core/utils/roster-legality';

import { Field, Tag, ToggleSwitch } from '@/components/ui';

interface DetachmentPickerProps {
  detachments: depot.Detachment[];
  selectedSlugs: string[];
  onChange: (slugs: string[]) => void;
  maxPoints: number;
  error?: string;
  'data-testid'?: string;
}

const DetachmentPicker: FC<DetachmentPickerProps> = ({
  detachments,
  selectedSlugs,
  onChange,
  maxPoints,
  error,
  'data-testid': dataTestId
}) => {
  const sorted = sortByName(detachments);
  const dpSpent = sorted
    .filter((detachment) => selectedSlugs.includes(detachment.slug))
    .reduce((total, detachment) => total + (parseInt(detachment.dp, 10) || 0), 0);
  const dpCap = getBattleSize(maxPoints).dp;
  // A single detachment is always legal; only combined DP is capped.
  const overCap = selectedSlugs.length > 1 && dpSpent > dpCap;

  const toggle = (slug: string) =>
    onChange(
      selectedSlugs.includes(slug)
        ? selectedSlugs.filter((entry) => entry !== slug)
        : [...selectedSlugs, slug]
    );

  return (
    <Field data-testid={dataTestId}>
      <div className="flex items-center justify-between">
        <span className="block text-sm font-medium text-body">Detachments</span>
        <span
          className={`text-sm font-semibold ${overCap ? 'text-danger-fg' : 'text-foreground'}`}
          data-testid="detachment-dp-total"
        >
          {dpSpent} / {dpCap} DP
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {sorted.map((detachment) => {
          const enabled = selectedSlugs.includes(detachment.slug);
          return (
            <div
              key={detachment.slug}
              className={`flex items-center justify-between gap-2 rounded-sm border px-3 py-2 ${
                enabled ? 'bg-info-surface border-info-border' : 'border-border-subtle'
              }`}
              data-testid={`detachment-option-${detachment.slug}`}
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {detachment.name}
                </span>
                {detachment.forceDisposition ? (
                  <span className="text-xs text-subtle">{detachment.forceDisposition}</span>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Tag size="sm" variant="secondary">
                  {detachment.type || `${detachment.dp || 0} DP`}
                </Tag>
                <ToggleSwitch
                  label=""
                  ariaLabel={`Select ${detachment.name}`}
                  enabled={enabled}
                  onChange={() => toggle(detachment.slug)}
                  size="sm"
                  testId={`detachment-toggle-${detachment.slug}`}
                />
              </div>
            </div>
          );
        })}
      </div>
      {error ? <p className="text-sm text-danger-fg">{error}</p> : null}
    </Field>
  );
};

export default DetachmentPicker;
