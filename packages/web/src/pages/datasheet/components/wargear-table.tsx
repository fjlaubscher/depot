import React from 'react';
import { depot } from '@depot/core';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  tableStyles
} from '@/components/ui/table';

interface WargearTableProps {
  wargear: depot.Wargear[];
  type: 'Ranged' | 'Melee';
}

const WargearTable: React.FC<WargearTableProps> = ({ wargear, type }) => {
  if (wargear.length === 0) return null;

  const isRanged = type === 'Ranged';

  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{type} Wargear</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={tableStyles.noWrap}>{type} Wargear</TableHead>
            {isRanged && <TableHead className={tableStyles.center}>Range</TableHead>}
            <TableHead className={tableStyles.center}>A</TableHead>
            <TableHead className={tableStyles.center}>{isRanged ? 'BS' : 'WS'}</TableHead>
            <TableHead className={tableStyles.center}>S</TableHead>
            <TableHead className={tableStyles.center}>AP</TableHead>
            <TableHead className={tableStyles.center}>D</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wargear.map((weapon) => (
            <TableRow key={`${type.toLowerCase()}-${weapon.line}`}>
              <TableCell className={`${tableStyles.noWrap} font-medium`}>
                {weapon.name}
                {weapon.description && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 lowercase">
                    [{weapon.description}]
                  </span>
                )}
              </TableCell>
              {isRanged && (
                <TableCell className={`${tableStyles.center} ${tableStyles.numeric}`}>
                  {weapon.range}"
                </TableCell>
              )}
              <TableCell className={`${tableStyles.center} ${tableStyles.numeric}`}>
                {weapon.a}
              </TableCell>
              <TableCell className={`${tableStyles.center} ${tableStyles.numeric}`}>
                {weapon.bsWs === 'N/A' ? weapon.bsWs : `${weapon.bsWs}+`}
              </TableCell>
              <TableCell className={`${tableStyles.center} ${tableStyles.numeric}`}>
                {weapon.s}
              </TableCell>
              <TableCell className={`${tableStyles.center} ${tableStyles.numeric}`}>
                {weapon.ap}
              </TableCell>
              <TableCell className={`${tableStyles.center} ${tableStyles.numeric}`}>
                {weapon.d}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WargearTable;
