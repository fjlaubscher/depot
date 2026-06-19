import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, tableStyles } from '@depot/web';

export const UnitRoster = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Unit</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Models</TableHead>
        <TableHead className={tableStyles.right}>Points</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Captain in Terminator Armour</TableCell>
        <TableCell>Character</TableCell>
        <TableCell className={tableStyles.numeric}>1</TableCell>
        <TableCell className={`${tableStyles.right} ${tableStyles.numeric}`}>95</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Terminator Squad</TableCell>
        <TableCell>Elites</TableCell>
        <TableCell className={tableStyles.numeric}>5</TableCell>
        <TableCell className={`${tableStyles.right} ${tableStyles.numeric}`}>185</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Intercessor Squad</TableCell>
        <TableCell>Battleline</TableCell>
        <TableCell className={tableStyles.numeric}>10</TableCell>
        <TableCell className={`${tableStyles.right} ${tableStyles.numeric}`}>200</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Redemptor Dreadnought</TableCell>
        <TableCell>Vehicle</TableCell>
        <TableCell className={tableStyles.numeric}>1</TableCell>
        <TableCell className={`${tableStyles.right} ${tableStyles.numeric}`}>210</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
