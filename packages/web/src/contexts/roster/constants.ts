import { depot } from '@depot/core';

export const initialState: depot.Roster = {
  id: '',
  name: '',
  factionId: '',
  detachment: {
    name: '',
    abilities: [],
    enhancements: [],
    stratagems: []
  },
  points: {
    current: 0,
    max: 2000
  },
  units: [],
  enhancements: []
};
