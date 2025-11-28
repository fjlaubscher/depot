import type { FC, ReactNode } from 'react';
import type { depot } from '@depot/core';

interface RosterUnitListProps {
  units: depot.RosterUnit[];
  renderUnit: (unit: depot.RosterUnit) => ReactNode;
  dataTestId?: string;
}

const RosterUnitList: FC<RosterUnitListProps> = ({ units, renderUnit, dataTestId }) => {
  return (
    <div className="flex flex-col gap-4" data-testid={dataTestId}>
      {units.map((unit) => renderUnit(unit))}
    </div>
  );
};

export default RosterUnitList;
