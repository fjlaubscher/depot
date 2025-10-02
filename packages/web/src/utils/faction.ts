import type { depot } from '@depot/core';

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

export const getDetachmentNames = (
  detachmentAbilities: depot.DetachmentAbility[],
  enhancements: depot.Enhancement[],
  stratagems: depot.Stratagem[]
): string[] => {
  const detachmentNames = new Set<string>();

  detachmentAbilities.forEach((ability) => detachmentNames.add(ability.detachment));
  enhancements.forEach((enhancement) => detachmentNames.add(enhancement.detachment));
  stratagems.forEach((stratagem) => detachmentNames.add(stratagem.detachment));

  return Array.from(detachmentNames).sort();
};

export const groupFactionDataByDetachment = (
  detachmentAbilities: depot.DetachmentAbility[],
  enhancements: depot.Enhancement[],
  stratagems: depot.Stratagem[]
): Record<
  string,
  {
    abilities: depot.DetachmentAbility[];
    enhancements: depot.Enhancement[];
    stratagems: depot.Stratagem[];
  }
> => {
  const detachmentNames = getDetachmentNames(detachmentAbilities, enhancements, stratagems);

  const detachments: Record<
    string,
    {
      abilities: depot.DetachmentAbility[];
      enhancements: depot.Enhancement[];
      stratagems: depot.Stratagem[];
    }
  > = {};

  // Initialize each detachment
  detachmentNames.forEach((name) => {
    if (!name) {
      return;
    }

    detachments[name] = {
      abilities: [],
      enhancements: [],
      stratagems: []
    };
  });

  const addToDetachment = (
    detachment: string,
    type: 'abilities' | 'enhancements' | 'stratagems',
    item: depot.DetachmentAbility | depot.Enhancement | depot.Stratagem
  ) => {
    if (!detachment) {
      return;
    }

    if (!detachments[detachment]) {
      detachments[detachment] = {
        abilities: [],
        enhancements: [],
        stratagems: []
      };
    }

    detachments[detachment][type].push(item as never);
  };

  // Group data by detachment
  detachmentAbilities.forEach((ability) => {
    addToDetachment(ability.detachment, 'abilities', ability);
  });

  enhancements.forEach((enhancement) => {
    addToDetachment(enhancement.detachment, 'enhancements', enhancement);
  });

  stratagems.forEach((stratagem) => {
    addToDetachment(stratagem.detachment, 'stratagems', stratagem);
  });

  return detachments;
};
