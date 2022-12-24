import { atom } from 'recoil';

const DataIndexAtom = atom<depot.Index[]>({
  key: 'data-index',
  default: []
});

export default DataIndexAtom;
