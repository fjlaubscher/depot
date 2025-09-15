import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { depot } from '@depot/core';
import { IconButton } from '@/components/ui';
import { Trash2, Copy, Edit } from 'lucide-react';
import RosterUnitCardBase from './roster-unit-card-base';

interface RosterUnitCardEditProps {
  unit: depot.RosterUnit;
  rosterId: string;
  onRemove: (unitId: string) => void;
  onDuplicate: (unit: depot.RosterUnit) => void;
  onUpdateWargear?: (unitId: string, wargear: depot.Wargear[]) => void;
}

const RosterUnitCardEdit: FC<RosterUnitCardEditProps> = ({
  unit,
  rosterId,
  onRemove,
  onDuplicate,
  onUpdateWargear
}) => {
  const actions = (
    <div className="flex items-center gap-1">
      <Link to={`/rosters/${rosterId}/units/${unit.id}/edit`}>
        <IconButton
          aria-label="Edit unit wargear and enhancements"
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <Edit size={16} />
        </IconButton>
      </Link>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
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
        onClick={(e) => {
          e.stopPropagation();
          onRemove(unit.id);
        }}
        aria-label="Remove unit from roster"
        variant="ghost"
        size="sm"
        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
      >
        <Trash2 size={16} />
      </IconButton>
    </div>
  );

  return <RosterUnitCardBase unit={unit} actions={actions} />;
};

export default RosterUnitCardEdit;
