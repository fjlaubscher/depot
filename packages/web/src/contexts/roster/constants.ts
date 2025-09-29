import type { depot } from '@depot/core';

export const initialState: depot.Roster = {
  id: '',
  name: '',
  factionId: '',
  factionSlug: '',
  faction: {
    id: '',
    slug: '',
    name: '',
    path: '',
    datasheetCount: 0,
    stratagemCount: 0,
    enhancementCount: 0,
    detachmentCount: 0
  },
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
