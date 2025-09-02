import { depot } from '@depot/core';

/**
 * Mock data utilities for testing
 * Provides reusable mock data structures for consistent testing
 */

export const mockDatasheet: depot.Datasheet = {
  id: 'captain',
  name: 'Captain',
  factionId: 'SM',
  sourceId: 'core',
  legend: '',
  role: 'CHARACTER', // Updated for 10th edition
  loadout: '',
  transport: '',
  virtual: false,
  leaderHead: '',
  leaderFooter: '',
  damagedW: '',
  damagedDescription: '',
  link: '/datasheet/captain',
  isForgeWorld: false,
  isLegends: false,
  leaders: [],
  modelCosts: [
    {
      datasheetId: 'SM_CAPTAIN',
      line: '1',
      description: 'Captain',
      cost: '80'
    },
    {
      datasheetId: 'SM_CAPTAIN',
      line: '2',
      description: 'Captain with Jump Pack',
      cost: '90'
    }
  ],
  models: [
    {
      datasheetId: 'SM_CAPTAIN',
      line: '1',
      name: 'Captain',
      m: '6"',
      t: '4',
      sv: '3+',
      invSv: '4++',
      invSvDescr: 'Iron Halo',
      w: '4',
      ld: '6+',
      oc: '1',
      baseSize: '32mm',
      baseSizeDescr: ''
    },
    {
      datasheetId: 'SM_CAPTAIN',
      line: '2',
      name: 'Lieutenant',
      m: '5"',
      t: '4',
      sv: '3+',
      invSv: '',
      invSvDescr: '',
      w: '3',
      ld: '7+',
      oc: '1',
      baseSize: '32mm',
      baseSizeDescr: ''
    }
  ],
  wargear: [
    {
      datasheetId: 'SM_CAPTAIN',
      line: '1',
      lineInWargear: '1',
      dice: '',
      name: 'Bolt pistol',
      type: 'Ranged',
      range: '12',
      a: '1',
      bsWs: '2',
      s: '4',
      ap: '0',
      d: '1',
      description: ''
    },
    {
      datasheetId: 'SM_CAPTAIN',
      line: '2',
      lineInWargear: '2',
      dice: '',
      name: 'Plasma gun',
      type: 'Ranged',
      range: '24',
      a: '1',
      bsWs: '3',
      s: '7',
      ap: '-2',
      d: '1',
      description:
        '[RAPID FIRE 1] When targeting this unit, weapons with this ability make 1 additional attack. You can re-roll one or more failed wound rolls when targeting this unit, but this weapon gets Hot on unmodified hit rolls of 1, after supercharge.'
    },
    {
      datasheetId: 'SM_CAPTAIN',
      line: '3',
      lineInWargear: '3',
      dice: '',
      name: 'Power sword',
      type: 'Melee',
      range: '',
      a: '4',
      bsWs: '2',
      s: '5',
      ap: '-2',
      d: '2',
      description: ''
    },
    {
      datasheetId: 'SM_CAPTAIN',
      line: '4',
      lineInWargear: '4',
      dice: '',
      name: 'Thunder hammer',
      type: 'Melee',
      range: '',
      a: '3',
      bsWs: 'N/A',
      s: '8',
      ap: '-2',
      d: '3',
      description:
        '[DEVASTATING WOUNDS] Critical wounds from this weapon cannot be negated by saves or abilities.'
    }
  ],
  abilities: [
    {
      id: 'leader',
      name: 'Leader',
      legend: '',
      factionId: 'SM',
      description: 'This model can be attached to a unit.'
    }
  ],
  keywords: [
    { datasheetId: 'SM_CAPTAIN', keyword: 'INFANTRY', model: '', isFactionKeyword: 'false' },
    { datasheetId: 'SM_CAPTAIN', keyword: 'CHARACTER', model: '', isFactionKeyword: 'false' },
    { datasheetId: 'SM_CAPTAIN', keyword: 'IMPERIUM', model: '', isFactionKeyword: 'true' },
    { datasheetId: 'SM_CAPTAIN', keyword: 'ADEPTUS ASTARTES', model: '', isFactionKeyword: 'true' }
  ],
  unitComposition: [
    {
      datasheetId: 'SM_CAPTAIN',
      line: '1',
      description: '1 Captain'
    }
  ],
  options: [
    {
      datasheetId: 'SM_CAPTAIN',
      line: '1',
      button: '',
      description: 'This model may be equipped with a jump pack.'
    }
  ],
  stratagems: [
    {
      id: 'rapid-fire',
      name: 'Rapid Fire',
      factionId: 'SM',
      type: 'Battle Tactic',
      cpCost: '1',
      turn: 'Any',
      detachment: 'Any',
      legend: '',
      phase: 'Any',
      description: 'Test stratagem description'
    }
  ],
  enhancements: [],
  detachmentAbilities: []
};

export const mockStratagem: depot.Stratagem = {
  id: 'rapid-fire',
  name: 'Rapid Fire',
  factionId: 'SM',
  type: 'Battle Tactic',
  cpCost: '1',
  turn: 'Any',
  detachment: 'Any',
  legend: '',
  phase: 'Any',
  description: 'Test stratagem description'
};

export const mockEnhancement: depot.Enhancement = {
  id: 'artificer-armour',
  name: 'Artificer Armour',
  factionId: 'SM',
  cost: '10',
  description: 'Enhanced armor protection',
  legend: '',
  detachment: 'Gladius Task Force'
};

export const mockDetachmentAbility: depot.DetachmentAbility = {
  id: 'combat-doctrines',
  name: 'Combat Doctrines',
  factionId: 'SM',
  description: 'Space Marines combat doctrines ability',
  legend: '',
  detachment: 'Gladius Task Force'
};

export const mockFaction: depot.Faction = {
  id: 'SM',
  name: 'Space Marines',
  link: '/faction/SM',
  datasheets: [mockDatasheet],
  stratagems: [mockStratagem],
  enhancements: [mockEnhancement],
  detachmentAbilities: [mockDetachmentAbility]
};

export const mockFactionIndex: depot.Index[] = [
  { id: 'SM', name: 'Space Marines', path: '/data/sm.json' },
  { id: 'CSM', name: 'Chaos Space Marines', path: '/data/csm.json' },
  { id: 'IG', name: 'Astra Militarum', path: '/data/ig.json' }
];

/**
 * Factory functions for creating test data variations
 */

export const createMockDatasheet = (overrides: Partial<depot.Datasheet> = {}): depot.Datasheet => ({
  ...mockDatasheet,
  ...overrides
});

export const createMockFaction = (overrides: Partial<depot.Faction> = {}): depot.Faction => ({
  ...mockFaction,
  ...overrides
});

export const createMockStratagem = (overrides: Partial<depot.Stratagem> = {}): depot.Stratagem => ({
  ...mockStratagem,
  ...overrides
});

/**
 * Common test data variations
 */

export const mockDatasheetWithoutCosts = createMockDatasheet({
  modelCosts: []
});

export const mockDatasheetWithSingleCost = createMockDatasheet({
  modelCosts: [{ description: 'Captain', cost: '80', datasheetId: 'SM_CAPTAIN', line: '1' }]
});

export const mockDatasheetWithMultipleStratagems = createMockDatasheet({
  stratagems: [
    mockStratagem,
    createMockStratagem({
      id: 'honor-the-chapter',
      name: 'Honor the Chapter',
      type: 'Strategic Ploy',
      cpCost: '2',
      description: 'Honor the chapter stratagem'
    })
  ]
});

export const mockFactionWithoutDatasheets = createMockFaction({
  datasheets: []
});

export const mockEmptyFaction = createMockFaction({
  datasheets: [],
  stratagems: [],
  enhancements: [],
  detachmentAbilities: []
});
