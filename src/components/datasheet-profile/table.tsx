import React from 'react';

// components
import Table from '../table';

interface Props {
  profiles: Wahapedia.DatasheetProfile[];
}

const DatasheetProfileTable: React.FC<Props> = ({ profiles }) => (
  <Table headings={['Models', 'Name', 'WS', 'BS', 'S', 'T', 'W', 'A', 'Ld', 'Sv', 'Points']}>
      {profiles.map((entry) => (
        <tr key={entry.line}>
          <td style={{ whiteSpace: 'nowrap' }}>{entry.models_per_unit}</td>
          <td>{entry.name}</td>
          <td>{entry.WS}</td>
          <td>{entry.BS}</td>
          <td>{entry.S}</td>
          <td>{entry.T}</td>
          <td>{entry.W}</td>
          <td>{entry.A}</td>
          <td>{entry.Ld}</td>
          <td>{entry.Sv}</td>
          <td>{entry.Cost}</td>
        </tr>
      ))}
  </Table>
);

export default DatasheetProfileTable;
