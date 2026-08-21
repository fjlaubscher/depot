import type { FC } from 'react';
import type { depot } from '@depot/core';

import { Button } from '@/components/ui';
import { RosterUnitCardCompact } from '@/components/shared/roster';

interface CollectionSelectionCardProps {
  unit: depot.CollectionUnit;
  selected: boolean;
  onToggle: (unitId: string) => void;
}

const CollectionSelectionCard: FC<CollectionSelectionCardProps> = ({
  unit,
  selected,
  onToggle
}) => {
  return (
    <RosterUnitCardCompact
      unit={unit}
      state={unit.state}
      onClick={() => onToggle(unit.id)}
      showWargearSummary
      dataTestId={`collection-selection-${unit.id}`}
      className={
        selected
          ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200 dark:border-primary-700 dark:bg-primary-900/30 dark:ring-primary-800'
          : undefined
      }
      actions={
        // Click bubbles to the card's onClick, which toggles.
        <Button size="sm" variant={selected ? 'secondary' : 'accent'}>
          {selected ? 'Selected' : 'Add'}
        </Button>
      }
    />
  );
};

export default CollectionSelectionCard;
