import React from 'react';

// components
import Table from '../table';

interface Props {
  profiles: depot.WargearProfile[];
}

const WargearProfileTable: React.FC<Props> = ({ profiles }) => (
  <Table headings={['Name', 'Type', 'Range', 'S', 'AP', 'D']}>
    {profiles.map((entry) => (
      <tr key={`${entry.wargearId}-${entry.line}`}>
        <td>{entry.name}</td>
        <td>{entry.type}</td>
        <td>{entry.range}</td>
        <td>{entry.s}</td>
        <td>{entry.ap}</td>
        <td>{entry.d}</td>
      </tr>
    ))}
  </Table>
);

export default WargearProfileTable;
