import React, { useState } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import type { depot } from '@depot/core';

import { IconButton } from '@/components/ui';
import { RosterUnitCardCompact, RosterUnitProfilePanel } from '@/components/shared/roster';

interface CollectionUnitCardProps {
  unit: depot.RosterUnit;
  collectionId: string;
  onRemove: (unitId: string) => void;
  onDuplicate: (unit: depot.RosterUnit) => void;
  state?: depot.CollectionUnitState;
  dataTestId?: string;
}

const CollectionUnitCard: React.FC<CollectionUnitCardProps> = ({
  unit,
  collectionId,
  onRemove,
  onDuplicate,
  state,
  dataTestId
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = () => {
    navigate(`/collections/${collectionId}/units/${unit.id}/edit`);
  };

  const handleToggleExpand = (event: MouseEvent) => {
    event.stopPropagation();
    setIsExpanded((previous) => !previous);
  };

  const actions = (
    <div className="flex items-center gap-2">
      <IconButton
        onClick={(event) => {
          event.stopPropagation();
          onDuplicate(unit);
        }}
        aria-label="Duplicate unit"
        variant="ghost"
        size="sm"
        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <Copy size={16} />
      </IconButton>
      <IconButton
        onClick={(event) => {
          event.stopPropagation();
          onRemove(unit.id);
        }}
        aria-label="Remove unit from collection"
        variant="ghost"
        size="sm"
        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
      >
        <Trash2 size={16} />
      </IconButton>
      <IconButton
        onClick={handleToggleExpand}
        aria-label={isExpanded ? 'Collapse unit details' : 'Expand unit details'}
        variant="ghost"
        size="sm"
        className="text-subtle hover:text-foreground"
        data-testid="collection-unit-toggle-details"
      >
        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </IconButton>
    </div>
  );

  return (
    <RosterUnitCardCompact
      unit={unit}
      actions={actions}
      onClick={handleCardClick}
      state={state}
      dataTestId={dataTestId}
      showWargearSummary={!isExpanded}
    >
      {isExpanded ? (
        <div
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <RosterUnitProfilePanel unit={unit} abilitiesTestId="collection-unit-abilities" />
        </div>
      ) : null}
    </RosterUnitCardCompact>
  );
};

export default CollectionUnitCard;
