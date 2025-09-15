import type { FC, ReactNode } from 'react';
import { depot } from '@depot/core';
import { Card, Tag, TagGroup, PointsTag } from '@/components/ui';

interface RosterUnitCardBaseProps {
  unit: depot.RosterUnit;
  actions?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
}

const RosterUnitCardBase: FC<RosterUnitCardBaseProps> = ({ unit, actions, children, onClick }) => {
  const unitPoints = parseInt(unit.modelCost.cost, 10) || 0;

  return (
    <Card
      className="relative flex flex-col gap-2"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate flex-1 min-w-0">
          {unit.datasheet.name}
        </h3>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="flex justify-between items-start gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {unit.modelCost.description}
        </span>
        <PointsTag points={unitPoints} className="whitespace-nowrap" />
      </div>

      {unit.selectedWargear.length > 0 && (
        <TagGroup spacing="sm">
          {unit.selectedWargear.map((wargear, index) => (
            <Tag key={index} variant="secondary" size="sm" className="capitalize">
              {wargear.name}
            </Tag>
          ))}
        </TagGroup>
      )}

      {children}
    </Card>
  );
};

export default RosterUnitCardBase;
