export const getFactionAlliance = (factionId: string) => {
  switch (factionId) {
    case 'AC':
    case 'AM':
    case 'AS':
    case 'AdM':
    case 'CA':
    case 'GK':
    case 'INQ':
    case 'OA':
    case 'QI':
    case 'RT':
    case 'SM':
    case 'TL':
      return 'Imperium';
    case 'CD':
    case 'CSM':
    case 'DG':
    case 'HTL':
    case 'QT':
    case 'RaH':
    case 'TS':
    case 'WE':
      return 'Chaos';
    case 'AE':
    case 'DRU':
    case 'GC':
    case 'LoV':
    case 'NEC':
    case 'ORK':
    case 'TAU':
    case 'TYR':
      return 'Xenos';
    default:
      return 'Unaligned';
  }
};
