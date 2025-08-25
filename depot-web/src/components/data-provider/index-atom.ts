import { atom } from 'recoil';
import { depot } from 'depot-core';

const DataIndexAtom = atom<depot.Index[]>({
  key: 'data-index',
  default: []
});

export default DataIndexAtom;
