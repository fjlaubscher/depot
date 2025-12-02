import type { FC, MouseEvent } from 'react';
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
  const rosterUnit: depot.RosterUnit = {
    id: unit.id,
    datasheet: unit.datasheet,
    modelCost: unit.modelCost,
    selectedWargear: unit.selectedWargear,
    selectedWargearAbilities: unit.selectedWargearAbilities,
    datasheetSlug: unit.datasheetSlug ?? unit.datasheet.slug
  };

  const handleToggle = (event?: MouseEvent) => {
    event?.stopPropagation();
    onToggle(unit.id);
  };

  return (
    <RosterUnitCardCompact
      unit={rosterUnit}
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
        <Button size="sm" variant={selected ? 'secondary' : 'accent'} onClick={handleToggle}>
          {selected ? 'Selected' : 'Add'}
        </Button>
      }
    />
  );
};

export default CollectionSelectionCard;
