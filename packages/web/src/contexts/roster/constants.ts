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
    detachmentCount: 0
  },
  detachment: {
    slug: '',
    name: '',
    abilities: [],
    enhancements: [],
    stratagems: []
  },
  points: {
    current: 0,
    max: 2000
  },
  warlordUnitId: null,
  units: [],
  enhancements: [],
  cogitatorAnalysis: null
};
