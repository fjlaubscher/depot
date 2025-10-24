import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import type { depot } from '@depot/core';
import { IconButton } from '@/components/ui';
import { Trash2, Copy } from 'lucide-react';
import RosterUnitCardCompact from './roster-unit-card-compact';

interface RosterUnitCardEditProps {
  unit: depot.RosterUnit;
  rosterId: string;
  onRemove: (unitId: string) => void;
  onDuplicate: (unit: depot.RosterUnit) => void;
}

const RosterUnitCardEdit: FC<RosterUnitCardEditProps> = ({
  unit,
  rosterId,
  onRemove,
  onDuplicate
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/rosters/${rosterId}/units/${unit.id}/edit`);
  };
  const actions = (
    <div className="flex items-center gap-1">
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

  return <RosterUnitCardCompact unit={unit} actions={actions} onClick={handleCardClick} />;
};

export default RosterUnitCardEdit;
