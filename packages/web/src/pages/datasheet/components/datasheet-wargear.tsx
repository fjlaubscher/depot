import React from 'react';
import { depot } from '@depot/core';
import WargearDisplay from '@/components/shared/wargear-display';

interface DatasheetWargearProps {
  datasheet: depot.Datasheet;
}

const DatasheetWargear: React.FC<DatasheetWargearProps> = ({ datasheet }) => {
  const { wargear } = datasheet;

  if (wargear.length === 0) {
    return null;
  }

  return (
    <WargearDisplay
      wargear={wargear}
      title=""
      showTypeHeaders={true}
      showCollapsibleWrapper={false}
      className="w-full"
    />
  );
};

export default DatasheetWargear;
