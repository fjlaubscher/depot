import type { FC } from 'react';
import { depot } from '@depot/core';
import { Card, IconButton } from '@/components/ui';
import { Trash2, Copy } from 'lucide-react';

interface RosterUnitCardProps {
  unit: depot.RosterUnit;
  onRemove: (unitId: string) => void;
  onDuplicate: (unit: depot.RosterUnit) => void;
  onUpdateWargear?: (unitId: string, wargear: depot.Wargear[]) => void;
}

const RosterUnitCard: FC<RosterUnitCardProps> = ({
  unit,
  onRemove,
  onDuplicate,
  onUpdateWargear
}) => {
  const unitPoints = parseInt(unit.modelCost.cost, 10) || 0;

  return (
    <Card className="relative">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate flex-1 min-w-0">
            {unit.datasheet.name}
          </h3>

          <div className="flex items-center gap-2">
            <IconButton
              onClick={() => onDuplicate(unit)}
              aria-label="Duplicate unit"
              variant="ghost"
              size="sm"
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Copy size={16} />
            </IconButton>
            <IconButton
              onClick={() => onRemove(unit.id)}
              aria-label="Remove unit from roster"
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 size={16} />
            </IconButton>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {unit.modelCost.description}
            </span>

            {unit.selectedWargear.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Wargear:</p>
                {unit.selectedWargear.map((wargear, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{wargear.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
            {unit.modelCost.cost} pts
          </span>
        </div>
      </div>
    </Card>
  );
};

export default RosterUnitCard;
