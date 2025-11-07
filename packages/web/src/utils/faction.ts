export const getFactionAlliance = (factionId: string) => {
  switch (factionId) {
    case 'AoI':
    case 'AC':
    case 'AM':
    case 'AS':
    case 'AdM':
    case 'GK':
    case 'QI':
    case 'SM':
    case 'TL':
      return 'Imperium';
    case 'CD':
    case 'CSM':
    case 'DG':
    case 'EC':
    case 'QT':
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
