import React from 'react';
import { depot } from 'depot-core';
import FactionGrid from './faction-grid';

interface FavouritesTabProps {
  favourites: depot.Index[];
}

const FavouritesTab: React.FC<FavouritesTabProps> = ({ favourites }) => {
  return <FactionGrid factions={favourites} />;
};

export default FavouritesTab;
