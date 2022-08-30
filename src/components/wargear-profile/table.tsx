import React from 'react';

// components
import Table from '../table';

interface Props {
  profiles: Wahapedia.WargearProfile[];
}

const WargearProfileTable: React.FC<Props> = ({ profiles }) => (
  <Table headings={['Name', 'Type', 'Range', 'S', 'AP', 'D']}>
    {profiles.map((entry) => (
      <tr key={`${entry.wargear_id}-${entry.line}`}>
        <td>{entry.name}</td>
        <td>{entry.type}</td>
        <td>{entry.Range}</td>
        <td>{entry.S}</td>
        <td>{entry.AP}</td>
        <td>{entry.D}</td>
      </tr>
    ))}
  </Table>
);

export default WargearProfileTable;
