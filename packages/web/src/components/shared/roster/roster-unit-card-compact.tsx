import type { FC, ReactNode } from 'react';
import classNames from 'classnames';
import type { depot } from '@depot/core';
import { Card, PointsTag, Tag, TagGroup } from '@/components/ui';

interface RosterUnitCardCompactProps {
  unit: depot.RosterUnit;
  actions?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
}

const RosterUnitCardCompact: FC<RosterUnitCardCompactProps> = ({
  unit,
  actions,
  children,
  onClick
}) => {
  const unitPoints = parseInt(unit.modelCost.cost, 10) || 0;
  const wargearToDisplay = unit.selectedWargear.slice(0, 3);
  const remainingWargearCount = unit.selectedWargear.length - wargearToDisplay.length;

  return (
    <Card padding="sm" className="relative flex flex-col gap-2" onClick={onClick}>
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">{unit.datasheet.name}</h3>
          {unit.modelCost.description ? (
            <span className="text-xs text-secondary truncate">{unit.modelCost.description}</span>
          ) : null}
          {unit.selectedWargear.length > 0 ? (
            <TagGroup spacing="sm" className="gap-1">
              {wargearToDisplay.map((wargear, index) => (
                <Tag
                  key={`compact-wargear-${index}`}
                  variant="secondary"
                  size="sm"
                  className="capitalize"
                >
                  {wargear.name.toLowerCase()}
                </Tag>
              ))}
              {remainingWargearCount > 0 ? (
                <Tag variant="default" size="sm">
                  +{remainingWargearCount} more
                </Tag>
              ) : null}
            </TagGroup>
          ) : null}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <PointsTag points={unitPoints} className="whitespace-nowrap" />
          {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
        </div>
      </div>

      {children}
    </Card>
  );
};

export default RosterUnitCardCompact;
