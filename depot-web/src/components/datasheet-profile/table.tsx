import React from 'react';

// components
import Table from '../table';

interface Props {
  profiles: depot.Model[];
}

const DatasheetProfileTable: React.FC<Props> = ({ profiles }) => (
  <Table headings={['#', 'Name', 'WS', 'BS', 'S', 'T', 'W', 'A', 'Ld', 'Sv', 'Cost']}>
    {profiles.map((entry) => (
      <tr key={entry.line}>
        <td style={{ whiteSpace: 'nowrap' }}>{entry.modelsPerUnit}</td>
        <td>{entry.name}</td>
        <td>{entry.ws}</td>
        <td>{entry.bs}</td>
        <td>{entry.s}</td>
        <td>{entry.t}</td>
        <td>{entry.w}</td>
        <td>{entry.a}</td>
        <td>{entry.ld}</td>
        <td>{entry.sv}</td>
        <td>{entry.cost}</td>
      </tr>
    ))}
  </Table>
);

export default DatasheetProfileTable;
