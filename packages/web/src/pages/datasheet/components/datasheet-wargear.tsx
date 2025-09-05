import React, { useMemo } from 'react';
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

interface DatasheetWargearProps {
  datasheet: depot.Datasheet;
}

const DatasheetWargear: React.FC<DatasheetWargearProps> = ({ datasheet }) => {
  const { models, wargear } = datasheet;

  const { rangedWargear, meleeWargear } = useMemo(() => {
    const ranged: depot.Wargear[] = [];
    const melee: depot.Wargear[] = [];

    wargear.forEach((weapon) => {
      if (weapon.type === 'Ranged') {
        ranged.push(weapon);
      } else if (weapon.type === 'Melee') {
        melee.push(weapon);
      }
    });

    return { rangedWargear: ranged, meleeWargear: melee };
  }, [wargear]);

  return (
    <div className="flex flex-col gap-6">
      {/* Model Profiles */}
      {models.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={tableStyles.noWrap}>Name</TableHead>
              <TableHead className={tableStyles.center}>M</TableHead>
              <TableHead className={tableStyles.center}>T</TableHead>
              <TableHead className={tableStyles.center}>Sv</TableHead>
              <TableHead className={tableStyles.center}>W</TableHead>
              <TableHead className={tableStyles.center}>Ld</TableHead>
              <TableHead className={tableStyles.center}>OC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((model) => (
              <TableRow key={model.line}>
                <TableCell className={`${tableStyles.noWrap} font-medium`}>{model.name}</TableCell>
                <TableCell className={`${tableStyles.center} ${tableStyles.numeric}`}>
                  {model.m}
                </TableCell>
                <TableCell className={`${tableStyles.center} ${tableStyles.numeric}`}>
                  {model.t}
                </TableCell>
                <TableCell className={`${tableStyles.center} ${tableStyles.numeric}`}>
                  {model.sv}
                </TableCell>
                <TableCell className={`${tableStyles.center} ${tableStyles.numeric}`}>
                  {model.w}
                </TableCell>
                <TableCell className={`${tableStyles.center} ${tableStyles.numeric}`}>
                  {model.ld}
                </TableCell>
                <TableCell className={`${tableStyles.center} ${tableStyles.numeric}`}>
                  {model.oc}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Ranged Weapons */}
      {rangedWargear.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={tableStyles.noWrap}>Ranged Wargear</TableHead>
              <TableHead className={tableStyles.center}>Range</TableHead>
              <TableHead className={tableStyles.center}>A</TableHead>
              <TableHead className={tableStyles.center}>BS</TableHead>
              <TableHead className={tableStyles.center}>S</TableHead>
              <TableHead className={tableStyles.center}>AP</TableHead>
              <TableHead className={tableStyles.center}>D</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rangedWargear.map((weapon) => (
              <TableRow key={`ranged-${weapon.line}`}>
                <TableCell className={`${tableStyles.noWrap} font-medium`}>
                  {weapon.name}
                  {weapon.description && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 lowercase">
                      [{weapon.description}]
                    </span>
                  )}
                </TableCell>
                <TableCell className={`${tableStyles.center} ${tableStyles.numeric}`}>
                  {weapon.range}"
                </TableCell>
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
      )}

      {/* Melee Weapons */}
      {meleeWargear.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={tableStyles.noWrap}>Melee Wargear</TableHead>
              <TableHead className={tableStyles.center}>A</TableHead>
              <TableHead className={tableStyles.center}>WS</TableHead>
              <TableHead className={tableStyles.center}>S</TableHead>
              <TableHead className={tableStyles.center}>AP</TableHead>
              <TableHead className={tableStyles.center}>D</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meleeWargear.map((weapon) => (
              <TableRow key={`melee-${weapon.line}`}>
                <TableCell className={`${tableStyles.noWrap} font-medium`}>
                  {weapon.name}
                  {weapon.description && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 lowercase">
                      [{weapon.description}]
                    </span>
                  )}
                </TableCell>
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
      )}
    </div>
  );
};

export default DatasheetWargear;
