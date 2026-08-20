import type { FC } from 'react';
import type { depot } from '@depot/core';

import { Tag, TagGroup } from '@/components/ui';
import { groupModelCostsBySection } from '@depot/core/utils/model-costs';

interface PointsCostsProps {
  costs: depot.ModelCost[];
  /** Used when a cost row has no description of its own. */
  fallbackName?: string;
  'data-testid'?: string;
}

/**
 * Points display for a datasheet. Simple units render a row of tags; units with
 * cost brackets (e.g. "1st to 2nd units" / "3rd+ unit") get one captioned row per bracket.
 */
export const PointsCosts: FC<PointsCostsProps> = ({
  costs,
  fallbackName,
  'data-testid': testId
}) => {
  const groups = groupModelCostsBySection(costs);
  if (groups.length === 0) return null;

  return (
    <div className="flex flex-col gap-2" data-testid={testId}>
      {groups.map((group) => (
        <div key={group.section || 'default'} className="flex flex-col gap-1">
          {group.section ? (
            <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
              {group.section}
            </span>
          ) : null}
          <TagGroup spacing="sm" className="flex-wrap">
            {group.costs.map((cost) => (
              <Tag key={`${cost.datasheetId}-${cost.line}`} variant="primary" size="sm">
                {cost.description || fallbackName || 'Unit'} · {cost.cost} pts
              </Tag>
            ))}
          </TagGroup>
        </div>
      ))}
    </div>
  );
};

export default PointsCosts;
