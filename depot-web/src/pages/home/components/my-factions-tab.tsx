import React from 'react';
import { depot } from 'depot-core';
import FactionGrid from './faction-grid';

interface MyFactionsTabProps {
  factions: depot.Index[];
}

const MyFactionsTab: React.FC<MyFactionsTabProps> = ({ factions }) => {
  return <FactionGrid factions={factions} />;
};

export default MyFactionsTab;
