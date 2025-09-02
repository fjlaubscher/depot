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

interface ModelProfileTableProps {
  models: depot.Model[];
}

const ModelProfileTable: React.FC<ModelProfileTableProps> = ({ models }) => {
  if (models.length === 0) return null;

  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Unit Profile</h4>
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
    </div>
  );
};

export default ModelProfileTable;
