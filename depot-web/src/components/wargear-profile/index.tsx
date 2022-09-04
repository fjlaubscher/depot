import React from 'react';

// components
import Card from '../card';
import WargearProfileTable from './table';

interface Props {
  wargear: depot.Wargear;
}

const WargearProfile: React.FC<Props> = ({ wargear }) => {
  const abilities: string[] = wargear.profiles
    .filter((p) => !!p.abilities)
    .map((p) => `${p.name} - ${p.abilities}`);
  return (
    <Card title={wargear.name}>
      <WargearProfileTable profiles={wargear.profiles} />
      {abilities.length > 0
        ? abilities.map((ability, i) => <p key={`ability-${i}`}>{ability}</p>)
        : undefined}
    </Card>
  );
};

export default WargearProfile;
